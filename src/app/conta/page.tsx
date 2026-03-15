import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CustomerAccountPage } from "@/components/customer-account-page";
import { getCurrentCustomerSession } from "@/lib/customer-auth";
import { listOrdersForCustomerAccount } from "@/lib/order-service";

export const metadata: Metadata = {
  title: "Conta",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AccountPage() {
  const session = await getCurrentCustomerSession();

  if (!session) {
    redirect("/login?next=%2Fconta");
  }

  let orders: Awaited<ReturnType<typeof listOrdersForCustomerAccount>> = [];

  try {
    orders = await listOrdersForCustomerAccount({
      customerId: session.account.customerId,
      email: session.account.email,
      limit: 12
    });
  } catch {
    orders = [];
  }

  return (
    <CustomerAccountPage
      customerName={session.account.fullName}
      email={session.account.email}
      linkedCustomerName={session.customer?.fullName || null}
      orders={orders}
    />
  );
}
