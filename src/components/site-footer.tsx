import Link from "next/link";
import { brand, pix, socialLinks, supportEmail } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{brand.name}</h3>
          <p className="mt-2 text-sm text-white/65">{brand.slogan}</p>
          <p className="mt-3 text-sm text-white/45">Entrega local no Rio de Janeiro - RJ</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Institucional</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <Link href="/politica-de-privacidade">Política de privacidade</Link>
            <Link href="/termos">Termos de uso</Link>
            <Link href="/trocas-e-devolucoes">Trocas e devoluções</Link>
            <Link href="/entregas">Frete e prazo</Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Atendimento</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>WhatsApp e humano sob demanda</span>
            <span>E-mail: {supportEmail}</span>
            <span>Instagram: @{brand.instagramHandle}</span>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e outros meios sob consulta</span>
            <span>Canais externos como Shopee e Mercado Livre continuam atendidos em paralelo</span>
            <span className="text-white/55">Pix com QR Code e copia e cola no checkout</span>
            <span className="text-white/55">Recebedor confirmado no app: CPF final {pix.cpfSuffix}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <a className="hover:text-white" href={socialLinks.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a className="hover:text-white" href={socialLinks.facebook} target="_blank" rel="noreferrer">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
