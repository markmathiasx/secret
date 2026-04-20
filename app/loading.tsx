export default function Loading() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="space-y-6">
        {/* Hero skeleton */}
        <div className="space-y-4">
          <div className="skeleton h-10 w-64" />
          <div className="skeleton h-6 w-full max-w-lg" />
          <div className="skeleton h-6 w-full max-w-md" />
        </div>

        {/* Stats bar skeleton */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>

        {/* Product grid skeleton */}
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton h-56 rounded-2xl" />
              <div className="skeleton h-4 w-16" />
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-4 w-full" />
              <div className="flex gap-2">
                <div className="skeleton h-6 w-16 rounded-full" />
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
              <div className="flex justify-between items-center">
                <div className="skeleton h-8 w-24" />
                <div className="skeleton h-10 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
