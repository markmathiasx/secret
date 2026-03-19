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

function buildSessionUrl() {
  if (typeof window === "undefined") {
    return "/api/auth/session";
  }

  const url = new URL("/api/auth/session", window.location.origin);
  url.searchParams.set("_session", String(Date.now()));
  return url.toString();
}

export async function fetchCustomerSession() {
  try {
    const response = await fetch(buildSessionUrl(), {
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        "Cache-Control": "no-store"
      }
    });
    const data = await response.json().catch(() => ({}));

    return {
      ok: response.ok,
      user: response.ok ? (data.user ?? null) : null
    } as const;
  } catch {
    return {
      ok: false,
      user: null
    } as const;
  }
}

export function useCustomerSession() {
  const [state, setState] = useState<SessionState>({ ready: false, user: null });

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const session = await fetchCustomerSession();

      if (!active) return;

      setState({
        ready: true,
        user: session.user
      });
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
