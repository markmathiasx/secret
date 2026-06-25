import { inspectPublicSecretEnv } from "@/src/lib/platform/security/secrets";

export const dynamic = "force-dynamic";

export default function AdminPlatformSecurityPage() {
  return <pre className="overflow-auto rounded-lg bg-slate-950 p-5 text-xs text-cyan-50">{JSON.stringify({ publicSecretEnvFindings: inspectPublicSecretEnv() }, null, 2)}</pre>;
}
