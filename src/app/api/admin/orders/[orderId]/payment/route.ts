import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { recordAnalyticsEvent } from "@/lib/analytics-server";
import { getCurrentAdminSession } from "@/lib/admin-auth";
import { updateOrderPayment } from "@/lib/order-service";
import { isDatabaseRuntimeError } from "@/lib/database-status";
import { adminPaymentSchema, enforceSameOrigin, getClientIp, isSecurityError, sanitizeInput } from "@/lib/security";

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
    const parsed = adminPaymentSchema.safeParse({
      redirectTo: sanitizeInput(String(formData.get("redirectTo") || fallbackRedirect), 200),
      status: sanitizeInput(String(formData.get("status") || "pending"), 40),
      verificationNote: sanitizeInput(String(formData.get("verificationNote") || ""), 500),
      pixReference: sanitizeInput(String(formData.get("pixReference") || ""), 160),
      cardBrand: sanitizeInput(String(formData.get("cardBrand") || ""), 40),
      cardLast4: sanitizeInput(String(formData.get("cardLast4") || ""), 4),
      cardHolderName: sanitizeInput(String(formData.get("cardHolderName") || ""), 160)
    });
    const redirectTo = parsed.success ? parsed.data.redirectTo : fallbackRedirect;

    if (!parsed.success) {
      const url = new URL(redirectTo, request.url);
      url.searchParams.set("error", "payment-update-invalid");
      return NextResponse.redirect(url);
    }

    await updateOrderPayment({
      orderId,
      status: parsed.data.status,
      verificationNote: parsed.data.verificationNote,
      pixReference: parsed.data.pixReference,
      cardBrand: parsed.data.cardBrand,
      cardLast4: parsed.data.cardLast4,
      cardHolderName: parsed.data.cardHolderName,
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
        paymentStatus: parsed.data.status,
        actor: session.email
      }
    });

    await appendAuditLog({
      actorType: "admin",
      actorId: session.email,
      action: "admin_order_payment_updated",
      resourceType: "order",
      resourceId: orderId,
      ipAddress: getClientIp(request.headers),
      userAgent: request.headers.get("user-agent"),
      payload: { paymentStatus: parsed.data.status }
    });

    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    const url = new URL(fallbackRedirect, request.url);
    url.searchParams.set(
      "error",
      isSecurityError(error) ? "forbidden" : isDatabaseRuntimeError(error) ? "db-unavailable" : "payment-update-failed"
    );
    return NextResponse.redirect(url);
  }
}
