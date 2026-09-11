const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatAdminBrl(value: number) {
  return BRL_FORMATTER.format(Number.isFinite(value) ? value : 0);
}
export function formatAdminMoneyInput(value: number) {
  return (Number.isFinite(value) ? value : 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseAdminMoney(input: string | number) {
  if (typeof input === "number") return Number.isFinite(input) ? Math.round(input * 100) / 100 : null;

  const raw = input.trim().replace(/\s/g, "").replace(/^R\$/i, "");
  if (!raw || !/^[+-]?[\d.,]+$/.test(raw)) return null;

  const comma = raw.lastIndexOf(",");
  const dot = raw.lastIndexOf(".");
  let normalized = raw;

  if (comma > dot) {
    normalized = raw.replace(/\./g, "").replace(",", ".");
  } else if (dot > comma && comma >= 0) {
    normalized = raw.replace(/,/g, "");
  } else if (comma >= 0) {
    normalized = raw.replace(",", ".");
  } else if ((raw.match(/\./g) || []).length > 1) {
    const parts = raw.split(".");
    normalized = `${parts.slice(0, -1).join("")}.${parts.at(-1)}`;
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
}
