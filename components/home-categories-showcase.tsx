import Link from "next/link";
import { Gamepad2, Home, KeyRound, Sparkles } from "lucide-react";

const categories = [
  { icon: KeyRound, title: "Chaveiros", description: "Um detalhe que acompanha você. Encontre modelos e opções com nome.", href: "/catalogo?type=keychain" },
  { icon: Sparkles, title: "Chibis", description: "Personagens em formato compacto para a sua coleção.", href: "/catalogo?style=chibi" },
  { icon: Gamepad2, title: "Games", description: "Explore universos, personagens e peças para o seu setup.", href: "/catalogo?category=games" },
  { icon: Home, title: "Casa & organização", description: "Soluções para colocar cada coisa no seu lugar.", href: "/catalogo?useCase=home" },
];

export function HomeCategoriesShowcase({ catalogCount }: { catalogCount: number }) {
  return (
    <section id="categorias" className="experience-container py-12 lg:py-16">
      <div className="experience-section-heading"><div><p className="section-kicker">O que combina com você?</p><h2>Um lugar para cada ideia.</h2></div><Link href="/catalogo" className="text-sm text-slate-300 hover:text-white">{catalogCount.toLocaleString("pt-BR")} opções ↗</Link></div>
      <div className="experience-collection-grid">
        {categories.map(({ icon: Icon, title, description, href }) => (
          <Link href={href} key={href} className="experience-collection"><Icon size={25} aria-hidden="true" /><h3>{title}</h3><p>{description}</p><span>Explorar coleção ↗</span></Link>
        ))}
      </div>
    </section>
  );
}
