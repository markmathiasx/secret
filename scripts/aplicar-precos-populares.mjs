import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const promptsDir = path.join(root, "prompts_txt", "by_slug");
const overridesPath = path.join(root, "data", "admin-product-overrides.json");
const reportsDir = path.join(root, "reports");

const toPrice90 = (value) => {
  const floored = Math.max(9, Math.floor(value));
  return Number(`${floored}.9`);
};

function inferBase(slug) {
  if (slug.startsWith("csv-cha-")) return 32;
  if (slug.startsWith("csv-col-")) return 74;
  if (slug.startsWith("csv-dec-")) return 69;
  if (slug.startsWith("csv-uti-")) return 64;
  if (slug.startsWith("real-")) return 79;
  if (slug.startsWith("mdh-")) return 59;
  return 49;
}

function inferAdjust(slug) {
  const s = slug.toLowerCase();
  let delta = 0;
  const rules = [
    ["acrilico", -2], ["emborrachado", 2], ["metalizado", 10], ["3d-", -2], ["mini-pingente", -4],
    ["chaveiro", -4], ["colecionavel", 12], ["chibi", 14], ["premium", 6], ["articulado", 18],
    ["luminaria", 28], ["quadro", 20], ["poster", 16], ["placa", 10], ["almofada", 12],
    ["caneca", 10], ["copo", 12], ["mousepad", 18], ["suporte-multiuso", 18], ["suporte-para-", 16],
    ["porta-ferramentas", 16], ["organizador", 12], ["kit-ferramenta", 10], ["caixa-de-musica", 36],
    ["porta-retrato", 20], ["aniversario", 18], ["calendario", 28], ["trofeu", 20], ["marcador", -6],
    ["abracadeira", -2], ["pingente", -4], ["nome-3d", 28], ["chaveiro-nome-dupla-face", -6],
    ["foto-litofania", 28], ["relogio", 34], ["prateleira", 24], ["espelho", 18], ["bicicleta", 48],
    ["joias", 28], ["dragao", 22], ["polvo", 18], ["tubarao", 14], ["coruja", 18], ["foguete", 14],
    ["cavaleiro", 20], ["robo", 24], ["pokemon", 6], ["marvel", 8], ["star-wars", 8],
    ["minecraft", 6], ["valorant", 8], ["league-of-legends", 8], ["fortnite", 8], ["cs2", 8], ["gta-v", 8]
  ];
  for (const [token, add] of rules) if (s.includes(token)) delta += add;
  return delta;
}

function displayNameFromSlug(slug) {
  return slug
    .replace(/^csv-/, "")
    .replace(/^mdh-\d+-/, "")
    .replace(/^real-\d+-/, "")
    .replace(/^\w+-\d+-/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.length <= 3 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function loadJson(file, fallback) {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function main() {
  await fs.mkdir(reportsDir, { recursive: true });
  const files = await fs.readdir(promptsDir);
  const slugs = files.filter((name) => name.endsWith(".txt")).map((name) => name.replace(/\.txt$/, "")).sort();
  const overrides = await loadJson(overridesPath, {});
  const report = [];

  for (const slug of slugs) {
    const pix = toPrice90(inferBase(slug) + inferAdjust(slug));
    const list = toPrice90(Math.max(pix + 8, pix * 1.18));
    const installment = Number((list / 12).toFixed(2));
    const current = typeof overrides[slug] === "object" && overrides[slug] ? overrides[slug] : {};
    overrides[slug] = {
      ...current,
      title: current.title || displayNameFromSlug(slug),
      price: pix,
      priceBrl: pix,
      pixPrice: pix,
      pixPriceBrl: pix,
      listPrice: list,
      listPriceBrl: list,
      installmentCount: 12,
      installmentPriceBrl: installment,
      pricingSource: "marketfit-popular-heuristic"
    };
    report.push({
      slug,
      title: overrides[slug].title,
      pixPriceBrl: pix,
      listPriceBrl: list,
      installmentCount: 12,
      installmentPriceBrl: installment,
      pricingSource: "marketfit-popular-heuristic"
    });
  }

  await fs.writeFile(overridesPath, JSON.stringify(overrides, null, 2) + "\n", "utf8");
  await fs.writeFile(path.join(reportsDir, "popular-pricing-report.json"), JSON.stringify({ ok: true, count: report.length, items: report }, null, 2) + "\n", "utf8");
  const csvLines = ["slug,title,pixPriceBrl,listPriceBrl,installmentCount,installmentPriceBrl,pricingSource"];
  for (const row of report) {
    const safeTitle = '"' + String(row.title).replace(/"/g, '""') + '"';
    csvLines.push([row.slug, safeTitle, row.pixPriceBrl, row.listPriceBrl, row.installmentCount, row.installmentPriceBrl, row.pricingSource].join(","));
  }
  await fs.writeFile(path.join(reportsDir, "popular-pricing-report.csv"), csvLines.join("\n") + "\n", "utf8");
  console.log(JSON.stringify({ ok: true, updated: report.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});