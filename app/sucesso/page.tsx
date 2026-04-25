import { ClearCartOnMount } from "@/components/clear-cart-on-mount";
import { MercadoPagoStatusPage } from "@/components/checkout/mercadopago-status-page";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; code?: string; payment_id?: string; status?: string; external_reference?: string; email?: string }>;
}) {
  const params = await searchParams;
  const orderCode = params.code || params.external_reference || params.order || null;

  return (
    <>
      <ClearCartOnMount />
      <MercadoPagoStatusPage
        variant="success"
        orderCode={orderCode}
        paymentId={params.payment_id || null}
        status={params.status || null}
        email={params.email || null}
      />
    </>
  );
}
