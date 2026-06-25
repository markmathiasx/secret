import Link from "next/link";

const links = [
  ["/admin/platform/health", "Health"],
  ["/admin/platform/cache", "Cache"],
  ["/admin/platform/db", "DB"],
  ["/admin/platform/jobs", "Jobs"],
  ["/admin/platform/observability", "Observability"],
  ["/admin/platform/load-test", "Load test"],
  ["/admin/platform/security", "Security"],
];

export default function AdminPlatformPage() {
  return (
    <main className="grid gap-3 rounded-[16px] border border-white/10 bg-slate-950/80 p-6 text-white md:grid-cols-3">
      {links.map(([href, label]) => (
        <Link key={href} href={href} className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4 font-bold text-cyan-50">
          {label}
        </Link>
      ))}
    </main>
  );
}
