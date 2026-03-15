import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/analytics-server";
import { getCurrentAdminSession } from "@/lib/admin-auth";
import { updateOrderOperationalStatus } from "@/lib/order-service";
import { isDatabaseRuntimeError } from "@/lib/database-status";

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { orderId } = await context.params;
  const formData = await request.formData();
  const redirectTo = String(formData.get("redirectTo") || `/admin/pedidos/${orderId}`);
  const nextStatus = String(formData.get("nextStatus") || "");

  try {
    await updateOrderOperationalStatus({
      orderId,
      nextStatus: nextStatus as any,
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
        nextStatus,
        actor: session.email
      }
    });

    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    const url = new URL(redirectTo, request.url);
    url.searchParams.set("error", isDatabaseRuntimeError(error) ? "db-unavailable" : "status-update-failed");
    return NextResponse.redirect(url);
  }
}
