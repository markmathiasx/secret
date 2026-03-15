import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/analytics-server";
import { getCurrentAdminSession } from "@/lib/admin-auth";
import { updateOrderPayment } from "@/lib/order-service";
import { isDatabaseRuntimeError } from "@/lib/database-status";

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { orderId } = await context.params;
  const formData = await request.formData();
  const redirectTo = String(formData.get("redirectTo") || `/admin/pedidos/${orderId}`);

  try {
    const nextPaymentStatus = String(formData.get("status") || "pending");
    await updateOrderPayment({
      orderId,
      status: nextPaymentStatus as any,
      verificationNote: String(formData.get("verificationNote") || ""),
      pixReference: String(formData.get("pixReference") || ""),
      cardBrand: String(formData.get("cardBrand") || ""),
      cardLast4: String(formData.get("cardLast4") || ""),
      cardHolderName: String(formData.get("cardHolderName") || ""),
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
        paymentStatus: nextPaymentStatus,
        actor: session.email
      }
    });

    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    const url = new URL(redirectTo, request.url);
    url.searchParams.set("error", isDatabaseRuntimeError(error) ? "db-unavailable" : "payment-update-failed");
    return NextResponse.redirect(url);
  }
}
