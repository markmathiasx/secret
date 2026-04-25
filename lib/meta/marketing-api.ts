import "server-only";
import { metaConfig, META_GRAPH_VERSION } from "./config";
import { graphGet, graphPost } from "./graph-api";
import type { GraphApiResponse } from "./types";

const GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

/**
 * Marketing API Sandbox utilities.
 * All operations default to PAUSED status and are scoped to the sandbox ad account.
 * Only accessible from the admin panel — never exposed to the public storefront.
 */

export interface AdCampaignDraft {
  name: string;
  objective: "OUTCOME_AWARENESS" | "OUTCOME_TRAFFIC" | "OUTCOME_ENGAGEMENT" | "OUTCOME_LEADS" | "OUTCOME_SALES";
  specialAdCategories?: string[];
}

export interface AdCampaignResult {
  id: string;
  name: string;
  status: string;
}

/** List campaigns in the sandbox ad account. */
export async function listSandboxCampaigns(): Promise<GraphApiResponse<{ data: AdCampaignResult[] }>> {
  const accountId = metaConfig.sandboxAdAccountId;
  if (!accountId) {
    return { ok: false, error: { message: "META_SANDBOX_AD_ACCOUNT_ID not set", type: "config", code: 0 } };
  }
  return graphGet(`act_${accountId}/campaigns`, {
    fields: "id,name,status,objective",
    limit: "20",
  });
}

/** Create a PAUSED draft campaign in the sandbox ad account. */
export async function createSandboxCampaign(
  draft: AdCampaignDraft
): Promise<GraphApiResponse<{ id: string }>> {
  const accountId = metaConfig.sandboxAdAccountId;
  if (!accountId) {
    return { ok: false, error: { message: "META_SANDBOX_AD_ACCOUNT_ID not set", type: "config", code: 0 } };
  }
  return graphPost(`act_${accountId}/campaigns`, {
    name: draft.name,
    objective: draft.objective,
    status: "PAUSED", // Always PAUSED in sandbox — never go active without explicit governance
    special_ad_categories: draft.specialAdCategories ?? [],
  });
}

/** Get basic ad account info. */
export async function getSandboxAdAccountInfo(): Promise<GraphApiResponse> {
  const accountId = metaConfig.sandboxAdAccountId;
  if (!accountId) {
    return { ok: false, error: { message: "META_SANDBOX_AD_ACCOUNT_ID not set", type: "config", code: 0 } };
  }
  return graphGet(`act_${accountId}`, { fields: "id,name,account_status,currency,amount_spent" });
}
