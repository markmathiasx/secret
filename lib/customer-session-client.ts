"use client";

import { useEffect, useState } from "react";

export type CustomerSessionUser = {
  id: string;
  email: string;
  displayName: string;
  role: "customer";
};

type SessionState = {
  ready: boolean;
  user: CustomerSessionUser | null;
};

export const customerAuthChangeEvent = "mdh:auth-change";

export function emitCustomerAuthChange() {
  window.dispatchEvent(new CustomEvent(customerAuthChangeEvent));
}

export function useCustomerSession() {
  const [state, setState] = useState<SessionState>({ ready: false, user: null });

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await response.json().catch(() => ({}));

        if (!active) return;

        setState({
          ready: true,
          user: response.ok ? (data.user ?? null) : null
        });
      } catch {
        if (!active) return;
        setState({ ready: true, user: null });
      }
    }

    void loadSession();
    window.addEventListener(customerAuthChangeEvent, loadSession);

    return () => {
      active = false;
      window.removeEventListener(customerAuthChangeEvent, loadSession);
    };
  }, []);

  return {
    ready: state.ready,
    user: state.user,
    loggedIn: Boolean(state.user)
  };
}
