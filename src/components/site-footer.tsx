import Link from 'next/link';
import { brand, footerLinks, socialLinks, supportEmail, whatsappNumber } from '@/lib/constants';

export function SiteFooter() {
  return (
    <footer className="footer-ambient border-t border-white/10 bg-slate-950/90">
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <div>
          <p className="section-kicker">{brand.name}</p>
          <h2 className="mt-3 text-2xl font-bold text-white">Impressão 3D premium para presentes, decoração, utilidades e projetos sob encomenda.</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/65">
            Produção local no Rio de Janeiro com atendimento humano, WhatsApp direto e operação pensada para fechar pedidos com clareza.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={`https://wa.me/${whatsappNumber}`} className="btn-zap">
              WhatsApp direto
            </a>
            <Link href="/catalogo" className="btn-glass">
              Abrir catálogo
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Institucional</p>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Atendimento</p>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            <a href={`https://wa.me/${whatsappNumber}`} className="transition hover:text-white">WhatsApp com atendimento humano</a>
            <a href={`mailto:${supportEmail}`} className="transition hover:text-white">{supportEmail}</a>
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="transition hover:text-white">
              @{brand.instagramHandle}
            </a>
            <p>Produção local e entrega no Rio de Janeiro - RJ</p>
          </div>
        </div>
      </div>
      <div className="relative border-t border-white/10 px-6 py-5 text-center text-sm text-white/45">
        © 2026 {brand.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
