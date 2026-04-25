export default function ProductLoading() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-3">
        <div className="skeleton h-3 w-10 rounded" />
        <div className="skeleton h-3 w-2 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-3 w-2 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>

      {/* Back link + chips skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="skeleton h-8 w-36 rounded-full" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-24 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        {/* Left column: image + model panel */}
        <div className="space-y-6">
          <div className="skeleton h-12 w-full rounded-2xl" />
          <div className="skeleton aspect-square w-full rounded-[28px]" />
          <div className="skeleton h-40 w-full rounded-[24px]" />
        </div>

        {/* Right column: price panel */}
        <div className="rounded-[28px] border border-white/10 bg-white/3 p-6 md:p-7 space-y-5">
          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {[80, 64, 72, 96].map((w, i) => (
              <div key={i} className={`skeleton h-6 rounded-full`} style={{ width: w }} />
            ))}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-5 w-full rounded" />
            <div className="skeleton h-5 w-5/6 rounded" />
          </div>

          {/* Rating */}
          <div className="skeleton h-5 w-40 rounded" />

          {/* Price block */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
            <div className="skeleton h-10 w-48 rounded" />
            <div className="skeleton h-5 w-36 rounded" />
            <div className="skeleton h-5 w-28 rounded" />
          </div>

          {/* CTA buttons */}
          <div className="space-y-3">
            <div className="skeleton h-14 w-full rounded-full" />
            <div className="skeleton h-12 w-full rounded-full" />
            <div className="skeleton h-12 w-full rounded-full" />
          </div>

          {/* Highlights */}
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="skeleton h-4 w-4 rounded-full" />
                <div className="skeleton h-4 rounded" style={{ width: `${60 + i * 10}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
