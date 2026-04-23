import { MercadoPagoStatusPage } from "@/components/checkout/mercadopago-status-page";

export const dynamic = "force-dynamic";

export default async function FailurePage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; code?: string; payment_id?: string; status?: string; external_reference?: string; email?: string }>;
}) {
  const params = await searchParams;
  const orderCode = params.code || params.external_reference || params.order || null;

  return (
    <MercadoPagoStatusPage
      variant="failure"
      orderCode={orderCode}
      paymentId={params.payment_id || null}
      status={params.status || null}
      email={params.email || null}
    />
  );
}
