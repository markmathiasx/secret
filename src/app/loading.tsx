export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="animate-pulse rounded-[36px] border border-white/10 bg-white/5 p-8">
        <div className="h-3 w-28 rounded-full bg-white/10" />
        <div className="mt-5 h-12 max-w-xl rounded-2xl bg-white/10" />
        <div className="mt-4 h-4 max-w-3xl rounded-full bg-white/10" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="aspect-[1.1/1] rounded-[28px] bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}
