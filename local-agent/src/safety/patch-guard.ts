export function classifyPatchSafety(diff: string) {
  const blocked = /(?:\.env|SECRET|TOKEN|PASSWORD|git push origin main|vercel deploy --prod)/i.test(diff);
  return {
    ok: !blocked,
    requiresTests: true,
    requiresHumanReview: true,
    reason: blocked ? "blocked_sensitive_or_direct_deploy_change" : "patch_safe_for_review",
  };
}
