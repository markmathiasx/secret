export const industrialTokens = {
  page: "industrial-page",
  shell: "industrial-shell",
  surface: "industrial-surface",
  panel: "industrial-panel",
  card: "industrial-card",
  section: "industrial-section",
  eyebrow: "industrial-eyebrow",
  title: "industrial-title",
  muted: "industrial-muted",
  grid: "industrial-grid",
  input: "industrial-input",
  button: "industrial-button",
  badge: "industrial-badge",
} as const;

export type IndustrialTone = "cyan" | "emerald" | "amber" | "rose" | "slate";

export const industrialToneClass: Record<IndustrialTone, string> = {
  cyan: "industrial-tone-cyan",
  emerald: "industrial-tone-emerald",
  amber: "industrial-tone-amber",
  rose: "industrial-tone-rose",
  slate: "industrial-tone-slate",
};
