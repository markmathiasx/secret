import { CatalogExplorer } from "@/components/catalog-explorer";
import { catalog } from "@/lib/catalog";

export default function CatalogPage() {
  return (
<<<<<<< ours
    <section className="mx-auto max-w-7xl px-6 py-14">
      <div className="mb-8 rounded-[36px] border border-white/10 bg-card p-7 md:p-9">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Catalogo</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black text-white md:text-5xl">
          Explore a loja completa com filtros claros, imagens estaveis e pagina de produto mais profissional.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/65">
          Esta pagina foi ajustada para mobile, tablet e desktop com foco em descoberta rapida, leitura limpa e CTA consistente.
=======
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-3xl">
<<<<<<< ours
<<<<<<< ours
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Catálogo MDH 3D</p>
        <h1 className="mt-3 text-4xl font-black text-white">Peças premium para setup, decoração e organização</h1>
        <p className="mt-4 text-lg leading-8 text-white/68">
          Explore coleções com produção local, personalização sob medida e entrega no Rio de Janeiro.
>>>>>>> theirs
=======
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Catálogo base</p>
        <h1 className="mt-3 text-4xl font-black text-white">Catálogo completo para operação comercial MDH 3D</h1>
        <p className="mt-4 text-lg leading-8 text-white/68">
          Navegue por categorias, filtros e páginas de produto com foco em conversão, prazo claro e personalização.
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Catálogo MDH 3D</p>
        <h1 className="mt-3 text-4xl font-black text-white">Peças premium para setup, decoração e organização</h1>
        <p className="mt-4 text-lg leading-8 text-white/68">
          Explore coleções com produção local, personalização sob medida e entrega no Rio de Janeiro.
>>>>>>> theirs
        </p>
      </div>

      <CatalogExplorer products={catalog} />
    </section>
  );
}
