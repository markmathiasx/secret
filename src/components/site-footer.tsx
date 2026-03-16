import Link from "next/link";
import { brand, pix, socialLinks, supportEmail, whatsappMessage, whatsappNumber } from "@/lib/constants";

export function SiteFooter() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <footer className="border-t border-white/10 bg-black/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{brand.name}</h3>
          <p className="mt-3 text-sm leading-7 text-white/62">{brand.slogan}</p>
          <p className="mt-3 text-sm text-white/48">Entrega local no Rio de Janeiro e retirada combinada.</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Loja</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/72">
            <Link href="/catalogo">Catalogo</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/entregas">Frete e prazo</Link>
            <Link href="/conta">Minha conta</Link>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Atendimento</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/72">
            <a href={whatsappHref}>WhatsApp comercial</a>
            <span>E-mail: {supportEmail}</span>
            <span>Instagram: @{brand.instagramHandle}</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Comercial</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/72">
            <span>Pix, cartao e boleto</span>
            <span>Atendimento direto pelo site e WhatsApp</span>
            <span>Pronta entrega, sob encomenda e personalizacao guiada</span>
            <span className="text-white/56">Recebedor Pix validado com final {pix.cpfSuffix}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <a className="hover:text-white" href={socialLinks.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a className="hover:text-white" href={socialLinks.facebook} target="_blank" rel="noreferrer">Facebook</a>
            <Link className="hover:text-white" href="/politica-de-privacidade">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
