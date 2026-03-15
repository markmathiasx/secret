export const buttonFamilies = {
  primary: "premium-btn premium-btn-primary",
  primaryPix: "premium-btn premium-btn-emerald",
  secondary: "premium-btn premium-btn-secondary",
  tertiary: "premium-btn premium-btn-ghost",
  danger: "premium-btn premium-btn-danger",
  icon: "premium-icon-btn"
} as const;

export function buttonClassName(...tokens: Array<string | false | null | undefined>) {
  return tokens.filter(Boolean).join(" ");
}
