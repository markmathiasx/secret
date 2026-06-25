import { z } from "zod";
import { platformJson } from "@/src/lib/platform/http/response";
import { sanitizeText } from "@/src/lib/platform/security/sanitize";

const schema = z.object({
  message: z.string().default("Quero atendimento da MDH3D pelo site."),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  const message = parsed.success ? sanitizeText(parsed.data.message, 500) : "Quero atendimento da MDH3D pelo site.";
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER || "5521974137662";
  return platformJson({
    ok: true,
    url: `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
  });
}
