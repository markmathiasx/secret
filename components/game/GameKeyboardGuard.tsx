"use client";

import { useEffect } from "react";

const keyboardEvents = ["keydown", "keypress", "keyup"] as const;

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    target.isContentEditable ||
    tag === "input" ||
    tag === "textarea" ||
    tag === "select"
  );
}

function isGameNavigationKey(event: KeyboardEvent) {
  return (
    event.code === "Space" ||
    event.key === " " ||
    event.key === "Spacebar" ||
    event.key.startsWith("Arrow")
  );
}

export function GameKeyboardGuard() {
  useEffect(() => {
    const guardedTargets = [
      window,
      document,
      document.documentElement,
      document.body,
    ].filter(Boolean) as EventTarget[];

    function preventPageScroll(event: Event) {
      if (!(event instanceof KeyboardEvent)) return;
      if (!isGameNavigationKey(event) || isEditableTarget(event.target)) return;
      event.preventDefault();
    }

    for (const target of guardedTargets) {
      for (const eventName of keyboardEvents) {
        target.addEventListener(eventName, preventPageScroll, true);
      }
    }

    return () => {
      for (const target of guardedTargets) {
        for (const eventName of keyboardEvents) {
          target.removeEventListener(eventName, preventPageScroll, true);
        }
      }
    };
  }, []);

  return null;
}
