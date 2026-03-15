import Link from "next/link";
import { brand, pix, socialLinks, supportEmail, whatsappContacts } from "@/lib/constants";

function isConfigured(url?: string) {
  return Boolean(url && url.startsWith("http"));
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/25 backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{brand.name}</h3>
          <p className="mt-3 text-sm leading-7 text-white/65">{brand.slogan}</p>
          <p className="mt-3 text-sm text-white/45">Operacao local no Rio de Janeiro com atendimento comercial direto.</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/55">Institucional</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/72">
            <Link href="/politica-de-privacidade">Politica de privacidade</Link>
            <Link href="/termos">Termos de uso</Link>
            <Link href="/trocas-e-devolucoes">Trocas e devolucoes</Link>
            <Link href="/entregas">Frete e prazo</Link>
            <Link href="/faq">Perguntas frequentes</Link>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/55">Atendimento</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/72">
            {whatsappContacts.map((contact) => (
              <span key={contact.id}>
                {contact.label}: +{contact.number}
              </span>
            ))}
            <span>E-mail: {supportEmail}</span>
            <span>Instagram: @{brand.instagramHandle}</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/55">Comercio e seguranca</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/72">
            <span>Pix, cartao e boleto</span>
            <span>Fluxo pronto para vitrine propria e marketplaces</span>
            <span>Confirmacao no app com CPF final {pix.cpfSuffix}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <span>
            © {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.
          </span>

          <div className="flex gap-4">
            {isConfigured(socialLinks.instagram) ? (
              <a className="hover:text-white" href={socialLinks.instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
            ) : null}
            {isConfigured(socialLinks.tiktok) ? (
              <a className="hover:text-white" href={socialLinks.tiktok} target="_blank" rel="noreferrer">
                TikTok
              </a>
            ) : null}
            {isConfigured(socialLinks.facebook) ? (
              <a className="hover:text-white" href={socialLinks.facebook} target="_blank" rel="noreferrer">
                Facebook
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
