import Link from "next/link";
import { Gamepad2, Home, KeyRound, Sparkles } from "lucide-react";
import { CATALOG_DIRECTORIES } from "@/lib/catalog-directories";

const icons = { chibis: Sparkles, games: Gamepad2, chaveiros: KeyRound, casa: Home };
const categories = CATALOG_DIRECTORIES.map((directory) => ({
  icon: icons[directory.id], title: directory.title, description: directory.description, href: directory.href,
}));

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
