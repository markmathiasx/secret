"use client";

/**
 * Invisible honeypot field to catch spam bots.
 * Bots fill in all fields including hidden ones.
 * If this field has a value on submission, it's a bot.
 */
export function HoneypotField({ name = "website" }: { name?: string }) {
  return (
    <div
      aria-hidden="true"
      tabIndex={-1}
      style={{
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        width: 0,
        height: 0,
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      <label htmlFor={`hp_${name}`}>{name}</label>
      <input
        type="text"
        id={`hp_${name}`}
        name={name}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

/**
 * Check if a honeypot field was filled (indicating a bot submission).
 */
export function isHoneypotFilled(formData: FormData, name = "website"): boolean {
  const value = formData.get(name);
  return typeof value === "string" && value.length > 0;
}
