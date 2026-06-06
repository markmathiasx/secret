import "server-only";
import { getAuthSecret, getSiteUrl } from "@/lib/env";
import { getCustomerSessionSecret, isSessionSecretConfigured } from "@/lib/session-token";

export function getAuthRuntimeConfig() {
  const authSecret = getAuthSecret();
  const customerSecret = getCustomerSessionSecret();

  return {
    siteUrl: getSiteUrl(),
    authSecretConfigured: isSessionSecretConfigured(authSecret),
    customerSessionSecretConfigured: isSessionSecretConfigured(customerSecret),
  };
}
