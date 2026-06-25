import { getAdminPlatformDal } from "@/src/lib/platform/data/admin-dal";
import { evaluateAiChatSafety } from "@/src/lib/ai-chat/evaluation";
import { verifyRollbackReadiness } from "@/src/lib/platform/rollback/verify-rollback";

export async function getAdminAiOperatorReport() {
  const [platform, aiChat] = await Promise.all([getAdminPlatformDal(), evaluateAiChatSafety()]);
  return {
    ok: aiChat.ok && verifyRollbackReadiness().ok,
    generatedAt: new Date().toISOString(),
    capabilities: [
      "audit_catalog",
      "audit_feed",
      "audit_performance",
      "audit_cache",
      "audit_db",
      "audit_routes",
      "generate_jobs",
      "view_jobs",
      "view_local_agent",
      "view_qwen_reports",
      "review_patch_proposal",
    ],
    restrictions: {
      mutatingActionsRequireConfirmation: true,
      patchRequiresBuildTestScore: true,
      noSecretsInPayload: true,
      noDirectDeploy: true,
      noMainPush: true,
    },
    platform,
    aiChat,
  };
}
