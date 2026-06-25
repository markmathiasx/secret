import { verifyPlatformBackup } from "@/src/lib/platform/backup/verify-backup";

export function restorePlatformBackupDryRun(dir: string) {
  const verification = verifyPlatformBackup(dir);
  return {
    ok: verification.ok,
    dryRun: true,
    message: verification.ok ? "Backup can be restored by the explicit restore workflow." : "Backup is invalid.",
    verification,
  };
}
