import Link from "next/link";
import { brand, businessRegistration, socialLinks, supportEmail, whatsappNumber } from "@/lib/constants";

export function SiteFooter(_props: { cardCheckoutReady?: boolean }) {
  return (
    <footer className="experience-footer">
      <div className="experience-footer-grid">
        <div>
          <p className="experience-footer-brand !text-2xl !font-semibold !tracking-widest">MDH 3D</p>
          <p className="mt-4 max-w-xs">Ideias pessoais. Produção local.<br />Impressão 3D para presentear, organizar e criar novas possibilidades.</p>
          <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="mt-3">@{brand.instagramHandle} ↗</a>
        </div>
        <nav aria-label="Explore a MDH"><h2>Encontre sua peça</h2><Link href="/catalogo">Catálogo completo</Link><Link href="/sob-medida">Peça sob medida</Link><Link href="/brindes-e-lotes">Brindes e lotes</Link><Link href="/como-funciona">Como funciona</Link><Link href="/jogue">Print Quest</Link><Link href="/blog">Ideias e guias</Link></nav>
        <nav aria-label="Ajuda e políticas"><h2>Compre com clareza</h2><Link href="/rastrear">Acompanhar pedido</Link><Link href="/conta">Minha conta</Link><Link href="/entregas">Frete e prazos</Link><Link href="/trocas-e-devolucoes">Trocas e devoluções</Link><Link href="/politica-de-privacidade">Privacidade</Link><Link href="/termos-de-compra">Termos de compra</Link></nav>
        <div><h2>Converse com a equipe</h2><a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a><br /><a href={`mailto:${supportEmail}`}>{supportEmail}</a><p className="mt-4">Produção no Rio de Janeiro.<br />Confirme retirada, envio e urgências antes de fechar seu pedido.</p>{businessRegistration ? <p className="mt-3">{businessRegistration}</p> : null}</div>
      </div>
      <div className="experience-footer-bottom"><span>© {new Date().getFullYear()} {brand.name}. Feito camada por camada.</span><span>Pix e cartão · Valores e prazo antes da confirmação</span></div>
    </footer>
  );
}
