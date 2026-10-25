import express from "express";
import helmet from "helmet";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  CheckoutError,
  createOrder,
  createPixPayment,
  reconcileMercadoPagoPayment,
  requireIdempotencyKey,
} from "./checkout.js";
import { PaymentProviderError, verifyWebhook } from "./mercado-pago.js";
import {
  HttpTimeoutError,
  captureBodyBytes,
  createRouteLimiter,
  forensicPath,
  logForensic,
  normalizeErrorCode,
  redactIdentifier,
  rejectInvalidJson,
  requestAudit,
  requireJson,
  withTimeout,
} from "./http-security.js";
const uuid = z.string().uuid();
const https = z
  .string()
  .url()
  .refine((v) => {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password;
  });
const address = z
  .object({
    recipient: z.string().trim().min(2).max(150),
    postalCode: z.string().regex(/^\d{8}$/),
    street: z.string().trim().min(2).max(200),
    number: z.string().trim().min(1).max(30),
    complement: z.string().max(150).default(""),
    district: z.string().max(150).default(""),
    city: z.string().trim().min(2).max(150),
    state: z.string().regex(/^[A-Z]{2}$/),
  })
  .strict();
const product = z
  .object({
    title: z.string().trim().min(2).max(200),
    description: z.string().max(10000).default(""),
    categoryId: uuid,
    priceCents: z.number().int().min(1).max(100000000),
    stock: z.number().int().min(0).max(1000000),
    imageUrl: https,
    modelUrl: https.nullable().default(null),
    published: z.boolean().default(false),
    availabilityMode: z
      .enum(["in_stock", "made_to_order", "out_of_stock"])
      .optional(),
  })
  .strict();
const paymentId = z.union([
  z.string().regex(/^\d{1,30}$/),
  z.number().int().positive().safe().transform(String),
]);
const mercadoPagoWebhook = z
  .object({
    action: z.string().trim().min(1).max(100).optional(),
    api_version: z.string().trim().min(1).max(30).optional(),
    data: z.object({ id: paymentId }).strict(),
    date_created: z.string().datetime({ offset: true }).optional(),
    id: paymentId.optional(),
    live_mode: z.boolean().optional(),
    type: z.literal("payment").optional(),
    user_id: paymentId.optional(),
  })
  .strict();
const projection =
  'p.id,p.legacy_id AS "legacyId",p.slug,p.title,p.description,p.price_cents AS "priceCents",p.stock,p.availability_mode AS "availabilityMode",p.production_window AS "productionWindow",p.material,p.finish,p.dimensions,p.image_alt AS "imageAlt",p.image_url AS "imageUrl",p.model_url AS "modelUrl",p.category_id AS "categoryId",p.seller_id AS "sellerId",p.product_type AS "productType",p.game,p.character_name AS "character",p.tags';
export function createApp({
  db,
  verifyToken,
  allowedOrigin = "",
  logger = console,
  paymentProvider = null,
  paymentSettings = null,
  trustProxy = false,
  authTimeoutMs = 5_000,
  rateLimits = {},
}) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", trustProxy);
  app.use(requestAudit({ logger }));
  app.use(helmet());
  const limiter = (name, defaults, userAware = false) => createRouteLimiter({
    name,
    logger,
    userAware,
    ...defaults,
    ...(rateLimits[name] || {}),
  });
  const globalLimiter = limiter("global", { windowMs: 60_000, limit: 300 });
  const healthLimiter = limiter("health", { windowMs: 60_000, limit: 30 });
  const catalogLimiter = limiter("catalog", { windowMs: 60_000, limit: 120 });
  const webhookLimiter = limiter("webhook", { windowMs: 60_000, limit: 60 });
  const authLimiter = limiter("authentication", { windowMs: 60_000, limit: 60 });
  const readLimiter = limiter("private_read", { windowMs: 60_000, limit: 120 }, true);
  const mutationLimiter = limiter("mutation", { windowMs: 60_000, limit: 30 }, true);
  const checkoutLimiter = limiter("checkout", { windowMs: 60_000, limit: 10 }, true);
  app.use(globalLimiter);
  app.use((req, res, next) => {
    if (req.headers.origin) {
      if (req.headers.origin !== allowedOrigin)
        return res.status(403).json({ error: "origin_forbidden" });
      res
        .set("Access-Control-Allow-Origin", allowedOrigin)
        .set("Vary", "Origin")
        .set("Access-Control-Allow-Headers", "Authorization,Content-Type,Idempotency-Key")
        .set(
          "Access-Control-Allow-Methods",
          "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        );
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.post(
    "/api/webhooks/mercadopago",
    webhookLimiter,
    express.json({ limit: "8kb", strict: true, verify: captureBodyBytes }),
    requireJson(8 * 1024),
    async (req, res) => {
      if (!paymentProvider || !paymentSettings?.webhookSecret)
        return res.status(503).json({ error: "payments_not_configured" });
      const query = z
        .object({
          "data.id": z.string().regex(/^\d{1,30}$/),
          type: z.literal("payment").optional(),
        })
        .passthrough()
        .parse(req.query);
      const body = mercadoPagoWebhook.parse(req.body);
      if (String(body.data.id) !== query["data.id"])
        throw new PaymentProviderError("PAYMENT_WEBHOOK_MISMATCH", 401);
      const verified = verifyWebhook({
        signature: req.headers["x-signature"],
        requestId: req.headers["x-request-id"],
        dataId: query["data.id"],
        secret: paymentSettings.webhookSecret,
      });
      const result = await reconcileMercadoPagoPayment({
        db,
        provider: paymentProvider,
        paymentData: verified.dataId,
        requestId: verified.requestId,
      });
      logForensic(logger, "info", "payment_webhook_handled", {
        requestId: req.requestId,
        path: forensicPath(req),
        status: 204,
        outcome: result.duplicate ? "duplicate" : result.ignored ? "ignored" : "processed",
        subjectHash: redactIdentifier(verified.dataId, req.logSalt),
      });
      res.sendStatus(204);
    },
  );
  app.use(express.json({ limit: "16kb", strict: true, verify: captureBodyBytes }));
  app.get("/health", healthLimiter, async (req, res) => {
    await db.query("SELECT 1");
    res.json({ status: "ok" });
  });
  app.get("/api/capabilities", catalogLimiter, (req, res) =>
    res.json({
      catalog: true,
      cart: true,
      addresses: true,
      orders: true,
      checkout: Boolean(paymentProvider && paymentSettings),
      payments: Boolean(paymentProvider && paymentSettings),
      chat: false,
      reviews: false,
      shipping: false,
      push: false,
      identity: "firebase",
      existingWebsiteAccountsLinked: false,
    }),
  );
  app.get("/api/categories", catalogLimiter, async (req, res) =>
    res.json({
      items: (
        await db.query(
          "SELECT id,name FROM mdh_marketplace.categories ORDER BY name",
        )
      ).rows,
    }),
  );
  app.get("/api/products", catalogLimiter, async (req, res) => {
    const query = z
      .object({
        categoryId: uuid.optional(),
        productType: z.string().trim().min(1).max(80).optional(),
        game: z.string().trim().min(1).max(120).optional(),
        character: z.string().trim().min(1).max(120).optional(),
        cursor: uuid.optional(),
        q: z.string().trim().max(100).optional(),
        limit: z.coerce.number().int().min(1).max(50).default(20),
      })
      .strict()
      .parse(req.query);
    const values = [];
    const clauses = ["p.published", "NOT u.disabled"];
    if (query.categoryId) {
      values.push(query.categoryId);
      clauses.push(`p.category_id=$${values.length}`);
    }
    if (query.productType) {
      values.push(query.productType);
      clauses.push(`lower(p.product_type)=lower($${values.length})`);
    }
    if (query.game) {
      values.push(query.game);
      clauses.push(`lower(p.game)=lower($${values.length})`);
    }
    if (query.character) {
      values.push(query.character);
      clauses.push(`lower(p.character_name)=lower($${values.length})`);
    }
    if (query.cursor) {
      values.push(query.cursor);
      clauses.push(`p.id>$${values.length}`);
    }
    if (query.q) {
      values.push(query.q);
      clauses.push(`(strpos(lower(p.title),lower($${values.length}))>0 OR strpos(lower(p.description),lower($${values.length}))>0 OR EXISTS (SELECT 1 FROM unnest(p.tags) tag WHERE strpos(lower(tag),lower($${values.length}))>0))`);
    }
    values.push(query.limit + 1);
    const rows = (
      await db.query(
        `SELECT ${projection} FROM mdh_marketplace.products p JOIN mdh_marketplace.users u ON u.id=p.seller_id WHERE ${clauses.join(" AND ")} ORDER BY p.id LIMIT $${values.length}`,
        values,
      )
    ).rows;
    res.json({
      items: rows.slice(0, query.limit),
      nextCursor: rows.length > query.limit ? rows[query.limit - 1].id : null,
    });
  });
  app.get("/api/products/:id", catalogLimiter, async (req, res) => {
    const id = uuid.parse(req.params.id);
    const result = await db.query(
      `SELECT ${projection} FROM mdh_marketplace.products p JOIN mdh_marketplace.users u ON u.id=p.seller_id WHERE p.id=$1 AND p.published AND NOT u.disabled`,
      [id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: "not_found" });
    res.json(result.rows[0]);
  });
  app.use("/api", authLimiter, async (req, res, next) => {
    const match = /^Bearer (\S+)$/.exec(req.headers.authorization || "");
    if (!match || match[1].length > 8192)
      return res.status(401).json({ error: "authentication_required" });
    let token;
    try {
      token = await withTimeout(() => verifyToken(match[1]), authTimeoutMs, "authentication_timeout");
    } catch (error) {
      if (error instanceof HttpTimeoutError)
        return res.status(error.status).json({ error: error.code });
      return res.status(401).json({ error: "invalid_token" });
    }
    if (typeof token.uid !== "string" || !/^[^\u0000-\u001f]{1,128}$/.test(token.uid))
      return res.status(401).json({ error: "invalid_token" });
    if (token.email !== undefined && token.email !== null &&
        (typeof token.email !== "string" || token.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(token.email)))
      return res.status(401).json({ error: "invalid_token" });
    if (token.email && token.email_verified !== true)
      return res.status(403).json({ error: "email_verification_required" });
    const user = (
      await db.query(
        "INSERT INTO mdh_marketplace.users(id,email) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET email=EXCLUDED.email RETURNING id,email,role,disabled",
        [token.uid, token.email_verified === true ? token.email || null : null],
      )
    ).rows[0];
    if (user.disabled)
      return res.status(403).json({ error: "account_disabled" });
    req.user = user;
    next();
  });
  app.get("/api/me", readLimiter, (req, res) =>
    res.json({ id: req.user.id, email: req.user.email, role: req.user.role }),
  );
  app.get("/api/cart", readLimiter, async (req, res) => {
    const items = (
      await db.query(
        `SELECT c.product_id AS "productId",c.quantity,p.title,p.price_cents AS "priceCents",p.image_url AS "imageUrl",p.stock,
          p.availability_mode AS "availabilityMode",
          (p.published AND NOT u.disabled AND (p.availability_mode='made_to_order' OR (p.availability_mode='in_stock' AND p.stock>=c.quantity))) AS available
         FROM mdh_marketplace.cart_items c JOIN mdh_marketplace.products p ON p.id=c.product_id
         JOIN mdh_marketplace.users u ON u.id=p.seller_id WHERE c.user_id=$1 ORDER BY c.product_id`,
        [req.user.id],
      )
    ).rows;
    res.json({
      items,
      totalCents: items.reduce(
        (sum, item) => sum + item.priceCents * item.quantity,
        0,
      ),
    });
  });
  app.put("/api/cart/items/:id", mutationLimiter, requireJson(1024), async (req, res) => {
    const id = uuid.parse(req.params.id);
    const { quantity } = z
      .object({ quantity: z.number().int().min(1).max(99) })
      .strict()
      .parse(req.body);
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "SELECT id FROM mdh_marketplace.users WHERE id=$1 FOR UPDATE",
        [req.user.id],
      );
      const p = (
        await client.query(
          'SELECT p.stock,p.availability_mode AS "availabilityMode" FROM mdh_marketplace.products p JOIN mdh_marketplace.users u ON u.id=p.seller_id WHERE p.id=$1 AND p.published AND NOT u.disabled',
          [id],
        )
      ).rows[0];
      if (
        !p ||
        p.availabilityMode === "out_of_stock" ||
        (p.availabilityMode === "in_stock" && p.stock < quantity)
      ) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "product_unavailable" });
      }
      const count = Number(
        (
          await client.query(
            "SELECT count(*) AS count FROM mdh_marketplace.cart_items WHERE user_id=$1",
            [req.user.id],
          )
        ).rows[0].count,
      );
      const exists = (
        await client.query(
          "SELECT 1 FROM mdh_marketplace.cart_items WHERE user_id=$1 AND product_id=$2",
          [req.user.id, id],
        )
      ).rows.length;
      if (count >= 100 && !exists) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "cart_limit" });
      }
      await client.query(
        "INSERT INTO mdh_marketplace.cart_items(user_id,product_id,quantity) VALUES($1,$2,$3) ON CONFLICT(user_id,product_id) DO UPDATE SET quantity=EXCLUDED.quantity",
        [req.user.id, id, quantity],
      );
      await client.query("COMMIT");
      res.sendStatus(204);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });
  app.delete("/api/cart/items/:id", mutationLimiter, async (req, res) => {
    await db.query(
      "DELETE FROM mdh_marketplace.cart_items WHERE user_id=$1 AND product_id=$2",
      [req.user.id, uuid.parse(req.params.id)],
    );
    res.sendStatus(204);
  });
  app.get("/api/addresses", readLimiter, async (req, res) =>
    res.json({
      items: (
        await db.query(
          'SELECT id,recipient,postal_code AS "postalCode",street,number,complement,district,city,state FROM mdh_marketplace.addresses WHERE user_id=$1 ORDER BY id',
          [req.user.id],
        )
      ).rows,
    }),
  );
  app.post("/api/addresses", mutationLimiter, requireJson(4096), async (req, res) => {
    const a = address.parse(req.body);
    const id = randomUUID();
    await db.query(
      "INSERT INTO mdh_marketplace.addresses(id,user_id,recipient,postal_code,street,number,complement,district,city,state) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
      [
        id,
        req.user.id,
        a.recipient,
        a.postalCode,
        a.street,
        a.number,
        a.complement,
        a.district,
        a.city,
        a.state,
      ],
    );
    res.status(201).json({ id, ...a });
  });
  app.delete("/api/addresses/:id", mutationLimiter, async (req, res) => {
    const r = await db.query(
      "DELETE FROM mdh_marketplace.addresses WHERE id=$1 AND user_id=$2 RETURNING id",
      [uuid.parse(req.params.id), req.user.id],
    );
    res.sendStatus(r.rows.length ? 204 : 404);
  });
  app.get("/api/orders", readLimiter, async (req, res) =>
    res.json({
      items: (
        await db.query(
          'SELECT id,status,total_cents::float8 AS "totalCents",created_at AS "createdAt" FROM mdh_marketplace.orders WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100',
          [req.user.id],
        )
      ).rows,
    }),
  );
  app.post("/api/orders", checkoutLimiter, async (req, res) => {
    if (!paymentProvider || !paymentSettings)
      return res.status(503).json({ error: "payments_not_configured" });
    if (rejectInvalidJson(req, res, 1024)) return;
    const input = z.object({ addressId: uuid }).strict().parse(req.body);
    const idempotencyKey = requireIdempotencyKey(req.headers["idempotency-key"]);
    const result = await createOrder({
      db,
      userId: req.user.id,
      addressId: input.addressId,
      idempotencyKey,
    });
    res.status(result.replayed ? 200 : 201).json(result);
  });
  app.post("/api/payments/pix", checkoutLimiter, async (req, res) => {
    if (!paymentProvider || !paymentSettings)
      return res.status(503).json({ error: "payments_not_configured" });
    if (rejectInvalidJson(req, res, 1024)) return;
    const input = z.object({ orderId: uuid }).strict().parse(req.body);
    const idempotencyKey = requireIdempotencyKey(req.headers["idempotency-key"]);
    const result = await createPixPayment({
      db,
      provider: paymentProvider,
      settings: paymentSettings,
      userId: req.user.id,
      email: req.user.email,
      orderId: input.orderId,
      idempotencyKey,
    });
    res.status(result.replayed ? 200 : 201).json(result);
  });
  app.get("/api/payments/:id", readLimiter, async (req, res) => {
    const id = uuid.parse(req.params.id);
    const payment = (
      await db.query(
        `SELECT id,order_id AS "orderId",status,provider_status AS "providerStatus",
                amount_cents::float8 AS "amountCents",qr_code AS "qrCode",
                qr_code_base64 AS "qrCodeBase64",expires_at AS "expiresAt",created_at AS "createdAt"
         FROM mdh_marketplace.payments WHERE id=$1 AND user_id=$2`,
        [id, req.user.id],
      )
    ).rows[0];
    if (!payment) return res.status(404).json({ error: "not_found" });
    res.json(payment);
  });
  app.get("/api/seller/products", readLimiter, async (req, res) => {
    if (!["seller", "admin"].includes(req.user.role))
      return res.status(403).json({ error: "seller_required" });
    res.json({
      items: (
        await db.query(
          `SELECT ${projection},p.published FROM mdh_marketplace.products p WHERE p.seller_id=$1 ORDER BY p.id`,
          [req.user.id],
        )
      ).rows,
    });
  });
  app.post("/api/seller/products", mutationLimiter, async (req, res) => {
    if (!["seller", "admin"].includes(req.user.role))
      return res.status(403).json({ error: "seller_required" });
    if (rejectInvalidJson(req, res, 16 * 1024)) return;
    const p = product.parse(req.body);
    const id = randomUUID();
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "INSERT INTO mdh_marketplace.products(id,seller_id,category_id,title,description,price_cents,stock,image_url,model_url,published,availability_mode) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
        [
          id,
          req.user.id,
          p.categoryId,
          p.title,
          p.description,
          p.priceCents,
          p.stock,
          p.imageUrl,
          p.modelUrl,
          p.published,
          p.availabilityMode ?? (p.stock > 0 ? "in_stock" : "out_of_stock"),
        ],
      );
      await client.query(
        "INSERT INTO mdh_marketplace.audit_log(actor_id,action,entity_id) VALUES($1,'product.create',$2)",
        [req.user.id, id],
      );
      await client.query("COMMIT");
      res.status(201).json({ id, ...p, sellerId: req.user.id });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });
  app.put("/api/seller/products/:id", mutationLimiter, async (req, res) => {
    if (!["seller", "admin"].includes(req.user.role))
      return res.status(403).json({ error: "seller_required" });
    if (rejectInvalidJson(req, res, 16 * 1024)) return;
    const id = uuid.parse(req.params.id);
    const p = product.parse(req.body);
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "UPDATE mdh_marketplace.products SET title=$1,description=$2,category_id=$3,price_cents=$4,stock=$5,image_url=$6,model_url=$7,published=$8,availability_mode=CASE WHEN $9::text IS NOT NULL THEN $9::text WHEN availability_mode='made_to_order' THEN availability_mode WHEN $5>0 THEN 'in_stock' ELSE 'out_of_stock' END,updated_at=now() WHERE id=$10 AND seller_id=$11 RETURNING id,availability_mode AS \"availabilityMode\"",
        [
          p.title,
          p.description,
          p.categoryId,
          p.priceCents,
          p.stock,
          p.imageUrl,
          p.modelUrl,
          p.published,
          p.availabilityMode ?? null,
          id,
          req.user.id,
        ],
      );
      if (!result.rows.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "not_found" });
      }
      await client.query(
        "INSERT INTO mdh_marketplace.audit_log(actor_id,action,entity_id) VALUES($1,'product.update',$2)",
        [req.user.id, id],
      );
      await client.query("COMMIT");
      res.json({ id, ...p, availabilityMode: result.rows[0].availabilityMode });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });
  app.use((req, res) => res.status(404).json({ error: "not_found" }));
  app.use((error, req, res, next) => {
    if (error instanceof z.ZodError)
      return res
        .status(400)
        .json({
          error: "invalid_input",
          fields: error.issues.map((i) => i.path.join(".")),
        });
    if (error instanceof CheckoutError || error instanceof PaymentProviderError || error instanceof HttpTimeoutError)
      return res.status(error.status || 500).json({ error: error.code.toLowerCase() });
    if (error.code === "23503")
      return res.status(400).json({ error: "invalid_reference" });
    if (error.type === "entity.too.large")
      return res.status(413).json({ error: "body_too_large" });
    if (error instanceof SyntaxError && error.status === 400)
      return res.status(400).json({ error: "invalid_json" });
    logForensic(logger, "error", "request_failed", {
      requestId: req.requestId,
      method: req.method,
      path: forensicPath(req),
      status: 500,
      code: normalizeErrorCode(error.code),
      ipHash: redactIdentifier(req.ip, req.logSalt),
      subjectHash: redactIdentifier(req.user?.id, req.logSalt),
    });
    res.status(500).json({ error: "internal_error" });
  });
  return app;
}
