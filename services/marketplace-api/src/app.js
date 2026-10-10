import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { randomUUID } from "node:crypto";
import { z } from "zod";
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
const projection =
  'p.id,p.legacy_id AS "legacyId",p.slug,p.title,p.description,p.price_cents AS "priceCents",p.stock,p.availability_mode AS "availabilityMode",p.production_window AS "productionWindow",p.material,p.finish,p.dimensions,p.image_alt AS "imageAlt",p.image_url AS "imageUrl",p.model_url AS "modelUrl",p.category_id AS "categoryId",p.seller_id AS "sellerId",p.product_type AS "productType",p.game,p.character_name AS "character",p.tags';
export function createApp({
  db,
  verifyToken,
  allowedOrigin = "",
  logger = console,
}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use((req, res, next) => {
    if (req.headers.origin) {
      if (req.headers.origin !== allowedOrigin)
        return res.status(403).json({ error: "origin_forbidden" });
      res
        .set("Access-Control-Allow-Origin", allowedOrigin)
        .set("Vary", "Origin")
        .set("Access-Control-Allow-Headers", "Authorization,Content-Type")
        .set(
          "Access-Control-Allow-Methods",
          "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        );
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use(
    rateLimit({
      windowMs: 60000,
      limit: 120,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: "32kb" }));
  app.get("/health", async (req, res) => {
    await db.query("SELECT 1");
    res.json({ status: "ok" });
  });
  app.get("/api/capabilities", (req, res) =>
    res.json({
      catalog: true,
      cart: true,
      addresses: true,
      orders: true,
      checkout: false,
      payments: false,
      chat: false,
      reviews: false,
      shipping: false,
      push: false,
      identity: "firebase",
      existingWebsiteAccountsLinked: false,
    }),
  );
  app.get("/api/categories", async (req, res) =>
    res.json({
      items: (
        await db.query(
          "SELECT id,name FROM mdh_marketplace.categories ORDER BY name",
        )
      ).rows,
    }),
  );
  app.get("/api/products", async (req, res) => {
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
  app.get("/api/products/:id", async (req, res) => {
    const id = uuid.parse(req.params.id);
    const result = await db.query(
      `SELECT ${projection} FROM mdh_marketplace.products p JOIN mdh_marketplace.users u ON u.id=p.seller_id WHERE p.id=$1 AND p.published AND NOT u.disabled`,
      [id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: "not_found" });
    res.json(result.rows[0]);
  });
  app.use("/api", async (req, res, next) => {
    const match = /^Bearer (\S+)$/.exec(req.headers.authorization || "");
    if (!match)
      return res.status(401).json({ error: "authentication_required" });
    let token;
    try {
      token = await verifyToken(match[1]);
    } catch {
      return res.status(401).json({ error: "invalid_token" });
    }
    if (typeof token.uid !== "string" || !token.uid)
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
  app.get("/api/me", (req, res) =>
    res.json({ id: req.user.id, email: req.user.email, role: req.user.role }),
  );
  app.get("/api/cart", async (req, res) => {
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
  app.put("/api/cart/items/:id", async (req, res) => {
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
  app.delete("/api/cart/items/:id", async (req, res) => {
    await db.query(
      "DELETE FROM mdh_marketplace.cart_items WHERE user_id=$1 AND product_id=$2",
      [req.user.id, uuid.parse(req.params.id)],
    );
    res.sendStatus(204);
  });
  app.get("/api/addresses", async (req, res) =>
    res.json({
      items: (
        await db.query(
          'SELECT id,recipient,postal_code AS "postalCode",street,number,complement,district,city,state FROM mdh_marketplace.addresses WHERE user_id=$1 ORDER BY id',
          [req.user.id],
        )
      ).rows,
    }),
  );
  app.post("/api/addresses", async (req, res) => {
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
  app.delete("/api/addresses/:id", async (req, res) => {
    const r = await db.query(
      "DELETE FROM mdh_marketplace.addresses WHERE id=$1 AND user_id=$2 RETURNING id",
      [uuid.parse(req.params.id), req.user.id],
    );
    res.sendStatus(r.rows.length ? 204 : 404);
  });
  app.get("/api/orders", async (req, res) =>
    res.json({
      items: (
        await db.query(
          'SELECT id,status,total_cents::float8 AS "totalCents",created_at AS "createdAt" FROM mdh_marketplace.orders WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100',
          [req.user.id],
        )
      ).rows,
    }),
  );
  app.post("/api/orders", (req, res) =>
    res.status(503).json({ error: "checkout_not_configured" }),
  );
  app.use("/api/payments", (req, res) =>
    res.status(503).json({ error: "payments_not_configured" }),
  );
  app.get("/api/seller/products", async (req, res) => {
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
  app.post("/api/seller/products", async (req, res) => {
    if (!["seller", "admin"].includes(req.user.role))
      return res.status(403).json({ error: "seller_required" });
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
  app.put("/api/seller/products/:id", async (req, res) => {
    if (!["seller", "admin"].includes(req.user.role))
      return res.status(403).json({ error: "seller_required" });
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
    if (error.code === "23503")
      return res.status(400).json({ error: "invalid_reference" });
    if (error.type === "entity.too.large")
      return res.status(413).json({ error: "body_too_large" });
    if (error instanceof SyntaxError && error.status === 400)
      return res.status(400).json({ error: "invalid_json" });
    logger.error({ event: "request_failed", code: error.code || "internal" });
    res.status(500).json({ error: "internal_error" });
  });
  return app;
}
