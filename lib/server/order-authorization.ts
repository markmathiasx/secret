import { cookies } from "next/headers";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { orderAccessCookieName, verifyOrderAccessToken } from "@/lib/order-access";

export async function canAccessOrder(order: {
  orderNumber: string;
  buyerId?: string | null;
  customerEmail?: string | null;
}) {
  const user = await getServerSessionUser();
  if (user && isAdminSession(user)) return true;
  if (user?.id && order.buyerId === user.id) return true;
  const token = (await cookies()).get(orderAccessCookieName)?.value;
  return Boolean(token && order.customerEmail && await verifyOrderAccessToken(token, {
    orderCode: order.orderNumber,
    customerEmail: order.customerEmail,
  }));
}
