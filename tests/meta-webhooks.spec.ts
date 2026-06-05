import { test, expect } from "@playwright/test";
import { createHmac } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const APP_SECRET = process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET || "";
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || "";
let prisma: typeof import("../lib/prisma").prisma;
let dbAvailable = false;

function loadDatabaseEnv() {
  for (const file of [".env.local", ".env", ".env.vercel.pull"]) {
    if (!existsSync(file)) continue;
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*(DATABASE_URL|DIRECT_URL)\s*=\s*(.+?)\s*$/);
      if (!match) continue;
      const value = match[2].replace(/^["']|["']$/g, "");
      const current = process.env[match[1]] || "";
      if (/^postgres(?:ql)?:\/\//.test(current)) continue;
      if (/^postgres(?:ql)?:\/\//.test(value)) {
        process.env[match[1]] = value;
      }
    }
  }
}

function sign(rawBody: string) {
  return `sha256=${createHmac("sha256", APP_SECRET).update(rawBody).digest("hex")}`;
}

function signedRequest(body: unknown) {
  const rawBody = JSON.stringify(body);
  return {
    data: rawBody,
    headers: {
      "content-type": "application/json",
      "x-hub-signature-256": sign(rawBody),
    },
  };
}

async function threadForEmail(email: string) {
  return prisma.chatThread.findFirst({
    where: { buyer: { email } },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

test.describe("Meta and omnichannel webhooks", () => {
  test.skip(!APP_SECRET || !VERIFY_TOKEN, "META_APP_SECRET and META_VERIFY_TOKEN are required for signed webhook tests");

  test.beforeAll(async () => {
    loadDatabaseEnv();
    if (!/^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL || "")) return;
    const imported = require("../lib/prisma") as typeof import("../lib/prisma");
    prisma = imported.prisma;
    dbAvailable = await prisma
      .$queryRaw`SELECT 1`
      .then(() => true)
      .catch(() => false);
  });

  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const testEmails = [
    `wa-5521999${suffix}@mdh.local`,
    `fb-pwfb${suffix}@mdh.local`,
    `ig-pwig${suffix}@mdh.local`,
    `igc-pwigc${suffix}@mdh.local`,
  ];

  test.afterAll(async () => {
    if (!prisma || !dbAvailable) return;
    try {
      const users = await prisma.user.findMany({
        where: { email: { in: testEmails } },
        select: { id: true },
      });
      const ids = users.map((user) => user.id);
      if (ids.length) {
        await prisma.chatThread.deleteMany({ where: { buyerId: { in: ids } } });
        await prisma.user.deleteMany({ where: { id: { in: ids } } });
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  test("GET handshake validates verify token on official webhook routes", async ({ request }) => {
    for (const route of ["/api/webhooks/whatsapp", "/api/webhooks/meta-messaging", "/api/webhooks/instagram"]) {
      const response = await request.get(
        `${BASE_URL}${route}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(VERIFY_TOKEN)}&hub.challenge=challenge-ok`
      );
      expect(response.status(), route).toBe(200);
      await expect(response.text()).resolves.toBe("challenge-ok");
    }
  });

  test("POST rejects invalid x-hub-signature-256", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/webhooks/whatsapp`, {
      data: JSON.stringify({ object: "whatsapp_business_account", entry: [] }),
      headers: {
        "content-type": "application/json",
        "x-hub-signature-256": "sha256=invalid",
      },
    });
    expect(response.status()).toBe(401);
  });

  test("WhatsApp payload creates a whatsapp inbox thread", async ({ request }) => {
    test.skip(!dbAvailable, "PostgreSQL DATABASE_URL must be reachable for inbox persistence assertions");
    const phone = `5521999${suffix}`;
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "waba-test",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: { display_phone_number: "552100000000", phone_number_id: "phone-test" },
                messages: [
                  {
                    id: `wamid.test.${suffix}`,
                    from: phone,
                    timestamp: String(Math.floor(Date.now() / 1000)),
                    type: "text",
                    text: { body: "quero atendimento humano" },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const response = await request.post(`${BASE_URL}/api/webhooks/whatsapp`, signedRequest(payload));
    expect(response.status()).toBe(200);

    await expect.poll(async () => threadForEmail(`wa-${phone}@mdh.local`)).not.toBeNull();
    const thread = await threadForEmail(`wa-${phone}@mdh.local`);
    expect(thread?.channel).toBe("whatsapp");
    expect(thread?.status).toBe("needs_human");
    expect(thread?.messages.some((message) => message.body.includes("atendimento humano"))).toBe(true);
  });

  test("Facebook Page payload creates a facebook_page inbox thread", async ({ request }) => {
    test.skip(!dbAvailable, "PostgreSQL DATABASE_URL must be reachable for inbox persistence assertions");
    const psid = `pwfb${suffix}`;
    const payload = {
      object: "page",
      entry: [
        {
          id: "page-test",
          time: Date.now(),
          messaging: [
            {
              sender: { id: psid },
              recipient: { id: "page-test" },
              timestamp: Date.now(),
              message: { mid: `mid.fb.${suffix}`, text: "qual o prazo de entrega?" },
            },
          ],
        },
      ],
    };

    const response = await request.post(`${BASE_URL}/api/webhooks/meta-messaging`, signedRequest(payload));
    expect(response.status()).toBe(200);

    await expect.poll(async () => threadForEmail(`fb-${psid}@mdh.local`)).not.toBeNull();
    const thread = await threadForEmail(`fb-${psid}@mdh.local`);
    expect(thread?.channel).toBe("facebook_page");
    expect(thread?.messages.some((message) => message.body.includes("prazo"))).toBe(true);
  });

  test("Instagram DM payload creates an instagram_dm inbox thread", async ({ request }) => {
    test.skip(!dbAvailable, "PostgreSQL DATABASE_URL must be reachable for inbox persistence assertions");
    const igsid = `pwig${suffix}`;
    const payload = {
      object: "instagram",
      entry: [
        {
          id: "ig-test",
          time: Date.now(),
          messaging: [
            {
              sender: { id: igsid },
              recipient: { id: "ig-business-test" },
              timestamp: Date.now(),
              message: { mid: `mid.ig.${suffix}`, text: "tem imagem validada?" },
            },
          ],
        },
      ],
    };

    const response = await request.post(`${BASE_URL}/api/webhooks/instagram`, signedRequest(payload));
    expect(response.status()).toBe(200);

    await expect.poll(async () => threadForEmail(`ig-${igsid}@mdh.local`)).not.toBeNull();
    const thread = await threadForEmail(`ig-${igsid}@mdh.local`);
    expect(thread?.channel).toBe("instagram_dm");
    expect(thread?.messages.some((message) => message.body.includes("imagem validada"))).toBe(true);
  });

  test("Instagram comment payload creates an instagram_comments inbox thread", async ({ request }) => {
    test.skip(!dbAvailable, "PostgreSQL DATABASE_URL must be reachable for inbox persistence assertions");
    const igUser = `pwigc${suffix}`;
    const payload = {
      object: "instagram",
      entry: [
        {
          id: "ig-test",
          time: Date.now(),
          changes: [
            {
              field: "comments",
              value: {
                from: { id: igUser, username: "cliente_teste" },
                media: { id: `media.${suffix}`, media_product_type: "FEED" },
                id: `comment.${suffix}`,
                text: "quanto custa essa peça?",
              },
            },
          ],
        },
      ],
    };

    const response = await request.post(`${BASE_URL}/api/webhooks/instagram`, signedRequest(payload));
    expect(response.status()).toBe(200);

    await expect.poll(async () => threadForEmail(`igc-${igUser}@mdh.local`)).not.toBeNull();
    const thread = await threadForEmail(`igc-${igUser}@mdh.local`);
    expect(thread?.channel).toBe("instagram_comments");
    expect(thread?.messages.some((message) => message.body.includes("quanto custa"))).toBe(true);
  });

  test("Business Login start is admin-only", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/auth/business-login/start`, { maxRedirects: 0 });
    expect([302, 307, 308]).toContain(response.status());
    expect(response.headers()["location"]).toContain("/admin/login");
  });
});
