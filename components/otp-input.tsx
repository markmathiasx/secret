"use client";

import { useRef, useState, ClipboardEvent, KeyboardEvent } from "react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Accessible 6-digit OTP input.
 * - Auto-advances on digit entry
 * - Backspace moves to previous field
 * - Supports paste of full code
 * - Numeric keyboard on mobile (inputMode="numeric")
 */
export function OtpInput({ length = 6, value, onChange, disabled }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, "").slice(0, length).split("");

  function focusAt(index: number) {
    inputsRef.current[index]?.focus();
  }

  function handleChange(index: number, char: string) {
    const digit = char.replace(/\D/g, "").slice(-1);
    const next = digits.slice();
    next[index] = digit;
    const newValue = next.join("").replace(/\s/g, "");
    onChange(newValue.slice(0, length));
    if (digit && index < length - 1) {
      focusAt(index + 1);
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = digits.slice();
        next[index] = "";
        onChange(next.join("").slice(0, length));
      } else if (index > 0) {
        focusAt(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusAt(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focusAt(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    const nextIndex = Math.min(pasted.length, length - 1);
    focusAt(nextIndex);
  }

  return (
    <div className="flex gap-2 justify-center" role="group" aria-label="Código de verificação">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`Dígito ${i + 1} do código`}
          className={`
            h-14 w-12 rounded-xl border text-center text-xl font-bold tabular-nums
            bg-white/5 text-white caret-cyan-400 transition
            focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/20
            disabled:opacity-40
            ${digits[i] ? "border-cyan-400/40" : "border-white/15"}
          `}
        />
      ))}
    </div>
  );
}
