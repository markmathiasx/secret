"use client";

export type CommerceFaqItem = {
  question: string;
  answer: string;
};

type CommerceFaqProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  items: CommerceFaqItem[];
};

export function CommerceFaq({ eyebrow = "FAQ", title, description, items }: CommerceFaqProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="rounded-[32px] border border-white/10 bg-black/20 p-6 md:p-8">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black text-white">{title}</h2>
        {description ? <p className="mt-4 text-sm leading-7 text-white/68">{description}</p> : null}
      </div>

      <div className="mt-6 grid gap-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-[24px] border border-white/10 bg-white/5 p-5 transition open:border-cyan-300/25 open:bg-cyan-300/10"
          >
            <summary className="cursor-pointer list-none text-left text-base font-semibold text-white marker:hidden">
              <span className="flex items-center justify-between gap-4">
                <span>{item.question}</span>
                <span className="text-cyan-100 transition group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-4 text-sm leading-7 text-white/72">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
