export default function Loading() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-xl bg-white/10" />
        <div className="h-5 w-full max-w-xl rounded-xl bg-white/10" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-48 rounded-3xl bg-white/10" />
          <div className="h-48 rounded-3xl bg-white/10" />
          <div className="h-48 rounded-3xl bg-white/10" />
        </div>
      </div>
    </section>
  );
}
