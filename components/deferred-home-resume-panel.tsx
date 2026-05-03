"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HomeResumePanel = dynamic(() => import("@/components/home-resume-panel").then((module) => module.HomeResumePanel), {
  ssr: false,
});

export function DeferredHomeResumePanel() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;

    const activate = () => setReady(true);
    const timeoutId = window.setTimeout(activate, 20_000);
    const eventOptions = { once: true, passive: true } as AddEventListenerOptions;

    window.addEventListener("pointerdown", activate, eventOptions);
    window.addEventListener("keydown", activate, { once: true });
    window.addEventListener("scroll", activate, eventOptions);
    window.addEventListener("touchstart", activate, eventOptions);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("pointerdown", activate);
      window.removeEventListener("keydown", activate);
      window.removeEventListener("scroll", activate);
      window.removeEventListener("touchstart", activate);
    };
  }, [ready]);

  return ready ? <HomeResumePanel /> : null;
}
