import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PedidoDetalhePage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/conta/pedidos/${encodeURIComponent(id)}`);
}
