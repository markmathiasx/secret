import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/admin-auth";
import { createAdminNote } from "@/lib/order-service";
import { isDatabaseRuntimeError } from "@/lib/database-status";

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { orderId } = await context.params;
  const formData = await request.formData();
  const redirectTo = String(formData.get("redirectTo") || `/admin/pedidos/${orderId}`);
  const content = String(formData.get("content") || "").trim();

  if (content) {
    try {
      await createAdminNote({
        orderId,
        content,
        author: session.email
      });
    } catch (error) {
      const url = new URL(redirectTo, request.url);
      url.searchParams.set("error", isDatabaseRuntimeError(error) ? "db-unavailable" : "note-create-failed");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
