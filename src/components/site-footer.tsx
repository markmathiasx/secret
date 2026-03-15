import Link from "next/link";
import { brand, pix, socialLinks, supportEmail } from "@/lib/constants";

export function SiteFooter() {
  const hasFacebook = Boolean(socialLinks.facebook);

  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-4">
        <div className="premium-card rounded-[28px] p-5 md:col-span-1">
          <h3 className="text-lg font-semibold text-white">{brand.name}</h3>
          <p className="mt-2 text-sm text-white/65">{brand.slogan}</p>
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
          <p className="mt-3 text-sm text-white/45">Producao local no Rio de Janeiro - RJ, com atendimento rapido, acabamento caprichado e pecas sob medida quando fizer sentido.</p>
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
=======
          <p className="mt-3 text-sm text-white/45">Produção local e entrega no Rio de Janeiro - RJ</p>
>>>>>>> theirs
        </div>
        <div className="premium-card rounded-[28px] p-5">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Institucional</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <Link href="/politica-de-privacidade">Política de privacidade</Link>
            <Link href="/politica-de-cookies">Politica de cookies</Link>
            <Link href="/termos">Termos de uso</Link>
            <Link href="/trocas-e-devolucoes">Trocas e devoluções</Link>
            <Link href="/entregas">Frete e prazo</Link>
            <Link href="/guias">Guias de impressao 3D</Link>
          </div>
        </div>
        <div className="premium-card rounded-[28px] p-5">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Atendimento</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
            <span>WhatsApp com atendimento rapido</span>
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
=======
            <span>WhatsApp com atendimento humano</span>
>>>>>>> theirs
            <span>E-mail: {supportEmail}</span>
            <span>Instagram oficial: @{brand.instagramHandle}</span>
          </div>
        </div>
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
        <div className="premium-card rounded-[28px] p-5">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix com melhor preco e cartao quando habilitado</span>
            <span>Atendimento por WhatsApp para combinacoes, kits e pecas sob medida</span>
            <span className="text-white/55">Pix com QR Code e copia e cola no checkout</span>
            <span className="text-white/55">Recebedor confirmado no app: CPF final {pix.cpfSuffix}</span>
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
=======
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Pagamento e segurança</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <span>Pix, cartão e boleto</span>
            <span>Checkout com QR Code e código copia e cola</span>
            <span className="text-white/55">Confirmação no app: CPF final {pix.cpfSuffix}</span>
>>>>>>> theirs
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.</span>
          <div className="flex gap-4">
<<<<<<< ours
            <a className="premium-chip h-auto px-3 py-1.5 text-xs" href={socialLinks.instagram} target="_blank" rel="noreferrer">Instagram</a>
            {hasFacebook ? <a className="premium-chip h-auto px-3 py-1.5 text-xs" href={socialLinks.facebook} target="_blank" rel="noreferrer">Facebook</a> : null}
=======
            <a className="hover:text-white" href={socialLinks.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a className="hover:text-white" href={socialLinks.tiktok} target="_blank" rel="noreferrer">TikTok</a>
            <a className="hover:text-white" href={socialLinks.facebook} target="_blank" rel="noreferrer">Facebook</a>
>>>>>>> theirs
          </div>
        </div>
      </div>
    </footer>
  );
}
