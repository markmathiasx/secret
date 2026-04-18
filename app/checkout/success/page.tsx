import Link from "next/link";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; code?: string; payment_id?: string; status?: string; external_reference?: string }>;
}) {
  const params = await searchParams;
  const orderCode = params.code || params.external_reference || params.order || null;
  const paymentId = params.payment_id || null;
  const paymentStatus = params.status || null;

  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/15">
        <CheckCircle2 className="h-10 w-10 text-emerald-300" />
      </div>

      <h1 className="mt-8 text-4xl font-black text-white">
        {paymentStatus === "approved" ? "Pagamento confirmado!" : "Pedido recebido!"}
      </h1>
      <p className="mt-4 text-lg leading-8 text-white/70">
        Obrigado pela sua compra. Nossa equipe já está preparando seu pedido.
      </p>

      {orderCode && (
        <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">Código do pedido</p>
          <p className="mt-2 text-2xl font-black text-cyan-100">{orderCode}</p>
          <p className="mt-2 text-sm text-white/55">
            Guarde este código para acompanhar o status pelo WhatsApp ou pela sua conta.
          </p>
        </div>
      )}

      {paymentId && (
        <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/60">
          <p>Referência do pagamento: <span className="text-white/80">{paymentId}</span></p>
        </div>
      )}

      <div className="mt-8 rounded-[24px] border border-cyan-300/15 bg-cyan-300/[0.08] p-6">
        <h2 className="font-semibold text-white">Próximos passos</h2>
        <div className="mt-4 space-y-3 text-left text-sm leading-7 text-white/70">
          <div className="flex items-start gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-xs font-bold text-cyan-100">1</span>
            <p>Você receberá confirmação por e-mail com os detalhes do pedido.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-xs font-bold text-cyan-100">2</span>
            <p>Nossa equipe iniciará a produção assim que o pagamento for confirmado.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-xs font-bold text-cyan-100">3</span>
            <p>Você pode acompanhar o status do pedido pela sua conta ou via WhatsApp.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/conta" className="btn-primary gap-2">
          <Package className="h-4 w-4" />
          Meus pedidos
        </Link>
        <Link href="/catalogo" className="btn-secondary gap-2">
          <ShoppingBag className="h-4 w-4" />
          Continuar comprando
        </Link>
      </div>
    </section>
  );
}
