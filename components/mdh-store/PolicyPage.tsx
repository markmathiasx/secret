import Link from "next/link";

export type PolicySection = {
  title: string;
  body: string;
};

export function PolicyPage({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: PolicySection[];
}) {
  return (
    <main className="min-h-screen bg-[#071016] px-4 py-12 text-white sm:px-6">
      <article className="mx-auto max-w-4xl">
        <Link href="/loja" className="text-sm font-bold text-cyan-100 underline-offset-4 hover:underline">
          Voltar para loja
        </Link>
        <p className="section-kicker mt-6">MDH3D</p>
        <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">{title}</h1>
        <p className="mt-4 text-lg leading-8 text-white/68">{description}</p>
        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-5">
              <h2 className="text-xl font-black text-white">{section.title}</h2>
              <p className="mt-2 leading-7 text-white/64">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
