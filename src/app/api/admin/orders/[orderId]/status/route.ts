import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { recordAnalyticsEvent } from "@/lib/analytics-server";
import { getCurrentAdminSession } from "@/lib/admin-auth";
import { updateOrderOperationalStatus } from "@/lib/order-service";
import { isDatabaseRuntimeError } from "@/lib/database-status";
import { adminStatusSchema, enforceSameOrigin, getClientIp, isSecurityError, sanitizeInput } from "@/lib/security";

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
    const parsed = adminStatusSchema.safeParse({
      redirectTo: sanitizeInput(String(formData.get("redirectTo") || fallbackRedirect), 200),
      nextStatus: sanitizeInput(String(formData.get("nextStatus") || ""), 40)
    });

    const redirectTo = parsed.success ? parsed.data.redirectTo : fallbackRedirect;
    if (!parsed.success) {
      const url = new URL(redirectTo, request.url);
      url.searchParams.set("error", "status-update-invalid");
      return NextResponse.redirect(url);
    }

    await updateOrderOperationalStatus({
      orderId,
      nextStatus: parsed.data.nextStatus,
      adminActor: session.email
    });

    await recordAnalyticsEvent({
      eventName: "admin_order_status_updated",
      scope: "admin",
      orderId,
      path: `/admin/pedidos/${orderId}`,
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
      payload: {
        nextStatus: parsed.data.nextStatus,
        actor: session.email
      }
    });

    await appendAuditLog({
      actorType: "admin",
      actorId: session.email,
      action: "admin_order_status_updated",
      resourceType: "order",
      resourceId: orderId,
      ipAddress: getClientIp(request.headers),
      userAgent: request.headers.get("user-agent"),
      payload: { nextStatus: parsed.data.nextStatus }
    });

    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    const url = new URL(fallbackRedirect, request.url);
    url.searchParams.set(
      "error",
      isSecurityError(error) ? "forbidden" : isDatabaseRuntimeError(error) ? "db-unavailable" : "status-update-failed"
    );
    return NextResponse.redirect(url);
  }
}
