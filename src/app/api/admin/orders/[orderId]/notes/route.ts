import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { getCurrentAdminSession } from "@/lib/admin-auth";
import { createAdminNote } from "@/lib/order-service";
import { isDatabaseRuntimeError } from "@/lib/database-status";
import { adminNoteSchema, enforceSameOrigin, getClientIp, isSecurityError, sanitizeInput } from "@/lib/security";

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await context.params;
  const fallbackRedirect = `/admin/pedidos/${orderId}`;

  try {
    enforceSameOrigin(request);
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const formData = await request.formData();
    const parsed = adminNoteSchema.safeParse({
      redirectTo: sanitizeInput(String(formData.get("redirectTo") || fallbackRedirect), 200),
      content: sanitizeInput(String(formData.get("content") || ""), 2_000)
    });
    const redirectTo = parsed.success ? parsed.data.redirectTo : fallbackRedirect;

    if (!parsed.success) {
      const url = new URL(redirectTo, request.url);
      url.searchParams.set("error", "note-create-invalid");
      return NextResponse.redirect(url);
    }

    if (parsed.data.content) {
      await createAdminNote({
        orderId,
        content: parsed.data.content,
        author: session.email
      });

      await appendAuditLog({
        actorType: "admin",
        actorId: session.email,
        action: "admin_order_note_created",
        resourceType: "order",
        resourceId: orderId,
        ipAddress: getClientIp(request.headers),
        userAgent: request.headers.get("user-agent")
      });
    }

    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    const url = new URL(fallbackRedirect, request.url);
    url.searchParams.set(
      "error",
      isSecurityError(error) ? "forbidden" : isDatabaseRuntimeError(error) ? "db-unavailable" : "note-create-failed"
    );
    return NextResponse.redirect(url);
  }
}
