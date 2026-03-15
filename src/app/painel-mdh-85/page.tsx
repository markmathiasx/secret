import { Box, Landmark, PackageCheck, ShoppingBag } from "lucide-react";
import { catalog, featuredCatalog } from "@/lib/catalog";
import { deliveryKm, whatsappNumber } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

<<<<<<< ours
const avgFeaturedPrice =
  featuredCatalog.reduce((total, product) => total + product.pricePix, 0) / Math.max(featuredCatalog.length, 1);
=======
const checklist = [
  "Trocar ADMIN_PASSWORD e ADMIN_SESSION_TOKEN no .env.local antes de publicar.",
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
  "Subir vídeos reais em biblioteca local de mídia para a home.",
=======
  "Validar mídia institucional da home e seção de produção.",
>>>>>>> theirs
=======
  "Validar mídia institucional da home e seção de produção.",
>>>>>>> theirs
=======
  "Validar mídia institucional da home e seção de produção.",
>>>>>>> theirs
=======
  "Validar mídia institucional da home e seção de produção.",
>>>>>>> theirs
=======
  "Subir vídeos reais em biblioteca local de mídia para a home.",
>>>>>>> theirs
  "Cadastrar suas peças campeãs com fotos próprias.",
  "Conectar WhatsApp Cloud API e testar webhook.",
  "Ativar domínio próprio e SSL via Vercel + Cloudflare."
];
>>>>>>> theirs

const metrics = [
  {
    title: "Itens no storefront",
    value: `${catalog.length}`,
    detail: "Catalogo em operacao com pagina de produto, busca e fallbacks de imagem.",
    icon: Box
  },
  {
    title: "Preco medio dos destaques",
    value: formatCurrency(avgFeaturedPrice),
    detail: "Referencia rapida para home, campanhas e atalho comercial.",
    icon: ShoppingBag
  },
  {
    title: "Frete base",
    value: formatCurrency(deliveryKm.baseFee),
    detail: `Modelo atual: ${deliveryKm.originLabel}.`,
    icon: PackageCheck
  },
  {
    title: "Canal humano",
    value: `+${whatsappNumber}`,
    detail: "Fallback principal quando alguma integracao estiver incompleta.",
    icon: Landmark
  }
] as const;

export default function HiddenAdminHomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-card p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Painel privado</p>
        <h2 className="mt-2 text-3xl font-black text-white">Operacao MDH 3D em modo resiliente para producao</h2>
        <p className="mt-3 text-white/65">
          Esta area resume o que ficou pronto para venda: storefront estavel, imagens locais, frete local e integracoes opcionais.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.title} className="rounded-[28px] border border-white/10 bg-card p-5">
            <span className="inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
              <metric.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm text-white/55">{metric.title}</p>
            <p className="mt-2 text-3xl font-black text-white">{metric.value}</p>
            <p className="mt-3 text-sm leading-7 text-white/65">{metric.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
