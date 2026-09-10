export const CONSENT_KEY = "mdh_cookie_consent";
export const CONSENT_EVENT = "mdh:consent-change";

export function hasMarketingConsent() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function setMarketingConsent(value: "accepted" | "rejected") {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
  return true;
}

export function subscribeMarketingConsent(listener: () => void) {
  const update = () => {
    const granted = hasMarketingConsent();
    window.fbq?.("consent", granted ? "grant" : "revoke");
    window.gtag?.("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
    });
    window.clarity?.("consent", granted);
    listener();
  };
  window.addEventListener(CONSENT_EVENT, update);
  window.addEventListener("storage", update);
  return () => {
    window.removeEventListener(CONSENT_EVENT, update);
    window.removeEventListener("storage", update);
  };
}
