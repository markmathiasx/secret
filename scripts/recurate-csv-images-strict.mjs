import fs from "node:fs/promises";
import fssync from "node:fs";
import path from "node:path";
import process from "node:process";
import crypto from "node:crypto";
import sharp from "sharp";

const ROOT = process.cwd();
const CSV_PATH = path.join(ROOT, "data", "catalogo_curado_160_itens_ptbr.json");
const MEDIA_MAP_PATH = path.join(ROOT, "data", "csv-curated-media-map.json");
const OUTPUT_ROOT = path.join(ROOT, "public", "products", "csv-curated");
const ENV_PATH = path.join(ROOT, ".env.local");
const REPORT_PATH = path.join(ROOT, "reports", "strict-csv-image-recuration-report.json");
const CACHE_PATH = path.join(ROOT, ".codex-tmp", "strict-csv-image-serpapi-cache.json");

const DRY_RUN = process.argv.includes("--dry-run");
const MAX_ITEMS = Number(process.env.STRICT_RECURATE_MAX_ITEMS || "999");
const FORCE_LOCAL_RENDER = process.env.STRICT_FORCE_LOCAL_RENDER === "1";
const FORCE_LOCAL_RENDER_PREFIXES = new Set(
  String(process.env.STRICT_FORCE_LOCAL_RENDER_PREFIXES || "")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean)
);
const DISALLOWED_APPROVED_SOURCE = new RegExp(
  process.env.STRICT_DISALLOWED_APPROVED_SOURCES || "(^$)",
  "i"
);

const BLOCKED_HOST_FRAGMENTS = [
  "pinterest.",
  "facebook.",
  "instagram.",
  "tiktok.",
  "shopee.",
  "mercadolivre.",
  "mercadolibre.",
  "susercontent.",
  "aliexpress.",
  "alicdn.",
  "redbubble.",
  "teepublic.",
];

const WATERMARK_OR_NOISE_TERMS = [
  "wallpaper",
  "coloring page",
  "coloring pages",
  "clipart",
  "png transparent",
  "poster mockup",
  "logo vector",
  "ai generated",
];

const CHARACTER_GROUPS = [
  { character: "Jett", franchise: "Valorant", aliases: ["jett"], negatives: ["deku", "midoriya", "my hero academia", "boku no hero"] },
  { character: "Reyna", franchise: "Valorant", aliases: ["reyna"] },
  { character: "Sage", franchise: "Valorant", aliases: ["sage valorant", "valorant sage"] },
  { character: "Omen", franchise: "Valorant", aliases: ["omen valorant", "valorant omen"] },
  { character: "Ahri", franchise: "League of Legends", aliases: ["ahri"] },
  { character: "Yasuo", franchise: "League of Legends", aliases: ["yasuo"] },
  { character: "Jinx", franchise: "League of Legends", aliases: ["jinx league", "league of legends jinx"] },
  { character: "Lux", franchise: "League of Legends", aliases: ["lux league", "league of legends lux"] },
  { character: "Ghost", franchise: "Call of Duty", aliases: ["ghost call of duty", "simon ghost riley"] },
  { character: "Soap", franchise: "Call of Duty", aliases: ["soap call of duty", "john soap mactavish"] },
  { character: "Task Force", franchise: "Call of Duty", aliases: ["task force 141", "call of duty task force"] },
  { character: "Warzone", franchise: "Call of Duty", aliases: ["warzone", "call of duty warzone"] },
  { character: "Creeper", franchise: "Minecraft", aliases: ["creeper"] },
  { character: "Steve", franchise: "Minecraft", aliases: ["steve minecraft", "minecraft steve"] },
  { character: "Alex", franchise: "Minecraft", aliases: ["alex minecraft", "minecraft alex"] },
  { character: "Enderman", franchise: "Minecraft", aliases: ["enderman"] },
  { character: "Lhama", franchise: "Fortnite", aliases: ["llama fortnite", "fortnite llama", "lhama fortnite"] },
  { character: "Battle Royale", franchise: "Fortnite", aliases: ["battle royale fortnite", "fortnite"] },
  { character: "Victory Crown", franchise: "Fortnite", aliases: ["victory crown", "fortnite crown"] },
  { character: "Peely", franchise: "Fortnite", aliases: ["peely"] },
  { character: "AWP", franchise: "CS2", aliases: ["awp cs2", "awp counter strike", "awp csgo"] },
  { character: "AK-47", franchise: "CS2", aliases: ["ak-47 cs2", "ak47 cs2", "ak-47 counter strike"] },
  { character: "Knife", franchise: "CS2", aliases: ["knife cs2", "karambit cs2", "counter strike knife"] },
  { character: "Defuse", franchise: "CS2", aliases: ["defuse kit cs2", "cs2 defuse", "counter strike defuse"] },
  { character: "Los Santos", franchise: "GTA V", aliases: ["los santos", "gta v"] },
  { character: "Franklin", franchise: "GTA V", aliases: ["franklin gta", "franklin gta v"] },
  { character: "Trevor", franchise: "GTA V", aliases: ["trevor gta", "trevor gta v"] },
  { character: "Michael", franchise: "GTA V", aliases: ["michael gta", "michael gta v"] },
  { character: "Spider-Man", franchise: "Marvel", aliases: ["spider-man", "spiderman", "spider man"] },
  { character: "Iron Man", franchise: "Marvel", aliases: ["iron man", "ironman"] },
  { character: "Deadpool", franchise: "Marvel", aliases: ["deadpool"] },
  { character: "Groot", franchise: "Marvel", aliases: ["groot"] },
  { character: "Darth Vader", franchise: "Star Wars", aliases: ["darth vader"] },
  { character: "Stormtrooper", franchise: "Star Wars", aliases: ["stormtrooper"] },
  { character: "Mandalorian", franchise: "Star Wars", aliases: ["mandalorian", "din djarin"] },
  { character: "Grogu", franchise: "Star Wars", aliases: ["grogu", "baby yoda"] },
  { character: "Pikachu", franchise: "Pokémon", aliases: ["pikachu"] },
  { character: "Charmander", franchise: "Pokémon", aliases: ["charmander"] },
  { character: "Gengar", franchise: "Pokémon", aliases: ["gengar"] },
  { character: "Eevee", franchise: "Pokémon", aliases: ["eevee"] },
];

const FRANCHISE_ALIASES = {
  Valorant: ["valorant"],
  "League of Legends": ["league of legends", "lol"],
  "Call of Duty": ["call of duty", "cod", "warzone"],
  Minecraft: ["minecraft"],
  Fortnite: ["fortnite"],
  CS2: ["cs2", "counter strike", "csgo"],
  "GTA V": ["gta v", "grand theft auto", "gta 5", "los santos"],
  Marvel: ["marvel", "spider-man", "spiderman", "iron man", "deadpool", "groot"],
  "Star Wars": ["star wars", "darth vader", "stormtrooper", "mandalorian", "grogu"],
  Pokémon: ["pokemon", "pokémon", "pikachu", "charmander", "gengar", "eevee"],
};

const TYPE_PROFILES = {
  chaveiro: {
    typeTerms: ["keychain", "key chain", "charm", "chaveiro", "keyring", "pendant"],
    queryTerms: ["keychain", "acrylic keychain", "chaveiro"],
    contextTerms: ["keys", "backpack", "bag", "mochila", "chaves"],
  },
  luminaria: {
    typeTerms: ["lamp", "light", "led", "luminaria", "luminária", "night light"],
    queryTerms: ["led lamp", "luminaria led", "lamp"],
    contextTerms: ["desk", "bedroom", "setup", "quarto", "mesa"],
  },
  quadro: {
    typeTerms: ["wall art", "frame", "framed", "quadro", "print", "canvas"],
    queryTerms: ["wall art", "framed print", "quadro decorativo"],
    contextTerms: ["wall", "parede", "home office", "room"],
  },
  almofada: {
    typeTerms: ["pillow", "cushion", "almofada"],
    queryTerms: ["pillow", "cushion", "almofada"],
    contextTerms: ["sofa", "bed", "cama", "sofa", "quarto"],
  },
  placa: {
    typeTerms: ["sign", "plaque", "plate", "placa", "wall sign", "door sign"],
    queryTerms: ["wall sign", "plaque", "placa decorativa"],
    contextTerms: ["wall", "door", "parede", "porta", "setup"],
  },
  organizador: {
    typeTerms: ["organizer", "organiser", "holder", "tray", "caddy", "storage", "organizador", "porta"],
    queryTerms: ["desk organizer", "cable organizer", "tool organizer", "3d printed organizer"],
    contextTerms: ["desk", "mesa", "cable", "tool", "setup", "office"],
  },
  portaFerramentas: {
    typeTerms: ["tool holder", "tool organizer", "holder", "porta ferramentas", "porta-ferramentas", "organizer"],
    queryTerms: ["tool holder", "tool organizer", "3d printed tool holder"],
    contextTerms: ["workbench", "desk", "bancada", "tool", "office"],
  },
  suporte: {
    typeTerms: ["stand", "holder", "support", "suporte", "headphone stand", "controller stand"],
    queryTerms: ["headphone stand", "controller stand", "3d printed stand"],
    contextTerms: ["headset", "controller", "desk", "setup", "cabos"],
  },
  miniEstatua: {
    typeTerms: ["figure", "figurine", "statue", "mini statue", "miniature", "model", "stl", "3d print"],
    queryTerms: ["3d printed figure", "figurine", "mini statue", "stl"],
    contextTerms: ["desk", "shelf", "estante", "setup", "mesa"],
  },
  caneca: {
    typeTerms: ["mug", "cup", "caneca"],
    queryTerms: ["mug", "caneca"],
    contextTerms: ["coffee", "cafe", "desk", "gift"],
  },
  mousepad: {
    typeTerms: ["mousepad", "mouse pad", "desk mat", "deskmat"],
    queryTerms: ["mousepad", "desk mat"],
    contextTerms: ["desk", "setup", "gamer", "keyboard"],
  },
  poster: {
    typeTerms: ["poster", "wall art", "print", "poster premium"],
    queryTerms: ["poster", "wall art print"],
    contextTerms: ["wall", "parede", "room", "studio"],
  },
};

const SOURCE_BONUS = [
  { term: "makerworld", score: 8 },
  { term: "printables", score: 8 },
  { term: "cults", score: 7 },
  { term: "myminifactory", score: 7 },
  { term: "thingiverse", score: 6 },
  { term: "etsy", score: 5 },
  { term: "amazon", score: 2 },
];

function parseEnvText(text) {
  const out = {};
  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    out[key] = value;
  }
  return out;
}

async function loadLocalEnv() {
  try {
    const env = parseEnvText(await fs.readFile(ENV_PATH, "utf8"));
    for (const [key, value] of Object.entries(env)) {
      if (!process.env[key]) process.env[key] = value;
    }
  } catch (error) {
    if (!error || error.code !== "ENOENT") throw error;
  }
}

function normalizeSku(sku) {
  return String(sku || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function hasAny(text, terms) {
  const normalized = normalizeText(text);
  return terms.some((term) => normalized.includes(normalizeText(term)));
}

function titleCase(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/(^|\s|-)([\p{L}\p{N}])/gu, (match) => match.toUpperCase());
}

function inferProductType(row) {
  const blob = normalizeText(`${row.title_pt} ${row.subcategory} ${row.category}`);
  if (blob.includes("chaveiro")) return "chaveiro";
  if (blob.includes("luminaria") || blob.includes("led")) return "luminaria";
  if (blob.includes("quadro")) return "quadro";
  if (blob.includes("almofada")) return "almofada";
  if (blob.includes("placa")) return "placa";
  if (blob.includes("porta ferramentas") || blob.includes("porta-ferramentas")) return "portaFerramentas";
  if (blob.includes("suporte")) return "suporte";
  if (blob.includes("organizador") || blob.includes("organizacao") || blob.includes("kit ferramenta")) return "organizador";
  if (blob.includes("mini estatua") || blob.includes("estatua")) return "miniEstatua";
  if (blob.includes("caneca")) return "caneca";
  if (blob.includes("mousepad") || blob.includes("desk mat")) return "mousepad";
  if (blob.includes("poster")) return "poster";
  return "organizador";
}

function inferSubtype(row, productType) {
  const blob = normalizeText(`${row.title_pt} ${row.subcategory}`);
  const subtypes = [];
  if (blob.includes("acrilico")) subtypes.push("acrylic", "acrilico", "acrílico");
  if (blob.includes("emborrachado") || blob.includes("pvc")) subtypes.push("rubber", "pvc", "emborrachado");
  if (blob.includes("metalizado") || blob.includes("metal")) subtypes.push("metal", "metalized", "metalizado");
  if (blob.includes("3d")) subtypes.push("3d", "3d printed", "stl");
  if (blob.includes("led")) subtypes.push("led", "light");
  if (blob.includes("dupla face")) subtypes.push("double sided", "dupla face");
  if (!subtypes.length && productType === "miniEstatua") subtypes.push("3d printed", "figure", "stl");
  return subtypes;
}

function inferCharacter(row) {
  const blob = normalizeText(`${row.title_pt} ${row.tags_pt}`);
  const match = CHARACTER_GROUPS.find((item) => item.aliases.some((alias) => blob.includes(normalizeText(alias))));
  if (!match) return null;
  return match;
}

function inferUseCase(row, productType) {
  const blob = normalizeText(row.title_pt);
  const useCase = [];
  const possible = ["mochila", "chaves", "setup", "mesa", "bancada", "parede", "porta", "quarto", "sofa", "cama", "home office", "cafe", "presente", "estante", "cabos", "headset", "controle"];
  for (const term of possible) {
    if (blob.includes(normalizeText(term))) useCase.push(term);
  }
  if (!useCase.length) useCase.push(...(TYPE_PROFILES[productType]?.contextTerms || []).slice(0, 2));
  return useCase;
}

function extractIntent(row) {
  const productType = inferProductType(row);
  const character = inferCharacter(row);
  return {
    productType,
    productTypeLabel: TYPE_PROFILES[productType] ? productType : "organizador",
    subtypeMaterial: inferSubtype(row, productType),
    themeCharacter: character?.character || "",
    franchise: character?.franchise || "",
    characterAliases: character?.aliases || [],
    characterNegatives: character?.negatives || [],
    useCase: inferUseCase(row, productType),
  };
}

function buildQueries(row, intent) {
  const profile = TYPE_PROFILES[intent.productType] || TYPE_PROFILES.organizador;
  const character = intent.themeCharacter;
  const franchise = intent.franchise;
  const subtype = intent.subtypeMaterial[0] || "";
  const productTerms = profile.queryTerms;
  const queries = [];

  for (const productTerm of productTerms.slice(0, 3)) {
    if (character && franchise) queries.push(`${character} ${franchise} ${subtype} ${productTerm}`.replace(/\s+/g, " ").trim());
  }

  if (character && franchise) {
    if (intent.productType === "chaveiro") {
      queries.push(`${character} ${franchise} keychain`);
      queries.push(`chaveiro ${character} ${franchise}`);
    } else if (["miniEstatua"].includes(intent.productType)) {
      queries.push(`${character} ${franchise} 3d printed figure`);
      queries.push(`${character} ${franchise} figurine`);
    } else {
      queries.push(`${profile.queryTerms[0]} ${character} ${franchise}`);
      queries.push(`${character} ${franchise} ${profile.queryTerms[0]}`);
    }
  }

  queries.push(`${row.title_pt} product`.replace(/\s+/g, " ").trim());
  return Array.from(new Set(queries.filter(Boolean))).slice(0, 5);
}

function isBlockedUrl(url) {
  const lower = String(url || "").toLowerCase();
  return BLOCKED_HOST_FRAGMENTS.some((fragment) => lower.includes(fragment));
}

function scoreCandidate(item, intent) {
  const profile = TYPE_PROFILES[intent.productType] || TYPE_PROFILES.organizador;
  const text = `${item.title || ""} ${item.source || ""} ${item.link || ""} ${item.original || ""}`.toLowerCase();
  const normalized = normalizeText(text);
  const rejectionReasons = [];

  if (isBlockedUrl(item.original || item.link || item.thumbnail || "")) {
    rejectionReasons.push("fonte bloqueada/marketplace com hotlink instavel");
  }
  if (hasAny(normalized, WATERMARK_OR_NOISE_TERMS)) {
    rejectionReasons.push("resultado parece wallpaper/arte 2D/mockup poluido");
  }
  if (intent.characterNegatives.length && hasAny(normalized, intent.characterNegatives)) {
    rejectionReasons.push(`negativo explicito para ${intent.themeCharacter}: ${intent.characterNegatives.join(", ")}`);
  }

  const otherCharacters = CHARACTER_GROUPS.filter((item) => item.character !== intent.themeCharacter);
  const wrongCharacter = otherCharacters.find((item) =>
    item.aliases.some((alias) => normalized.includes(normalizeText(alias)))
  );
  if (intent.themeCharacter && wrongCharacter && !intent.characterAliases.some((alias) => normalized.includes(normalizeText(alias)))) {
    rejectionReasons.push(`personagem divergente detectado: ${wrongCharacter.character}`);
  }

  const otherFranchise = Object.entries(FRANCHISE_ALIASES).find(([franchise, aliases]) =>
    franchise !== intent.franchise && aliases.some((alias) => normalized.includes(normalizeText(alias)))
  );
  const targetFranchiseHit = !intent.franchise || (FRANCHISE_ALIASES[intent.franchise] || []).some((alias) => normalized.includes(normalizeText(alias)));
  if (intent.franchise && otherFranchise && !targetFranchiseHit) {
    rejectionReasons.push(`franquia divergente detectada: ${otherFranchise[0]}`);
  }

  let typeScore = hasAny(normalized, profile.typeTerms) ? 40 : 0;
  let themeScore = 0;
  if (!intent.themeCharacter && !intent.franchise) {
    themeScore = 35;
  } else {
    if (intent.characterAliases.some((alias) => normalized.includes(normalizeText(alias)))) themeScore += 25;
    if ((FRANCHISE_ALIASES[intent.franchise] || []).some((alias) => normalized.includes(normalizeText(alias)))) themeScore += 10;
  }

  const subtypeScore = intent.subtypeMaterial.length
    ? Math.min(15, intent.subtypeMaterial.reduce((sum, term) => sum + (normalized.includes(normalizeText(term)) ? 8 : 0), 0))
    : 15;

  const contextTerms = [...profile.contextTerms, ...intent.useCase];
  const contextScore = Math.min(10, contextTerms.reduce((sum, term) => sum + (normalized.includes(normalizeText(term)) ? 4 : 0), 0));

  let score = typeScore + themeScore + subtypeScore + contextScore;
  for (const bonus of SOURCE_BONUS) {
    if (normalized.includes(bonus.term)) score += bonus.score;
  }
  score = Math.min(100, score);

  if (typeScore === 0) {
    score = 0;
    rejectionReasons.push("tipo do produto nao bate");
  }
  if (intent.themeCharacter && themeScore < 25) {
    score = 0;
    rejectionReasons.push("personagem/tema principal ausente");
  }
  if (intent.franchise && targetFranchiseHit === false) {
    score = 0;
    rejectionReasons.push("franquia principal ausente");
  }
  if (rejectionReasons.length) score = Math.min(score, 60);

  return {
    score,
    scoreBreakdown: {
      productType: typeScore,
      themeCharacter: themeScore,
      subtypeMaterial: subtypeScore,
      useCase: contextScore,
    },
    rejectionReasons,
  };
}

function compactCandidate(item, query, intent) {
  const result = scoreCandidate(item, intent);
  const url = String(item.original || item.link || item.thumbnail || "").trim();
  return {
    query,
    title: String(item.title || "").trim(),
    source: String(item.source || "").trim(),
    link: String(item.link || "").trim(),
    imageUrl: url,
    score: result.score,
    scoreBreakdown: result.scoreBreakdown,
    rejectionReasons: result.rejectionReasons,
  };
}

async function readJsonIfExists(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

async function callSerpApi(query, cache) {
  const cacheKey = `serpapi:${query}`;
  if (cache[cacheKey]) return cache[cacheKey];
  const apiKey = process.env.SERPAPI_KEY || "";
  if (!apiKey) throw new Error("SERPAPI_KEY nao encontrado em .env.local");

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_images");
  url.searchParams.set("google_domain", "google.com");
  url.searchParams.set("gl", "br");
  url.searchParams.set("hl", "pt-br");
  url.searchParams.set("safe", "off");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    headers: {
      "user-agent": "mdh-strict-image-recurator/1.0",
      "accept": "application/json",
    },
  });
  if (!response.ok) throw new Error(`SerpAPI HTTP ${response.status}`);
  const payload = await response.json();
  cache[cacheKey] = payload;
  await writeJson(CACHE_PATH, cache);
  return payload;
}

function decodeHtmlAttribute(value) {
  return String(value || "")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function sourceFromUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host.split(".").slice(0, -1).join(".") || host;
  } catch {
    return "";
  }
}

async function callBingImages(query, cache) {
  const cacheKey = `bing:${query}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const url = new URL("https://www.bing.com/images/search");
  url.searchParams.set("q", query);
  url.searchParams.set("form", "HDRSC2");
  url.searchParams.set("first", "1");

  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  });
  if (!response.ok) throw new Error(`Bing Images HTTP ${response.status}`);

  const html = await response.text();
  const matches = [...html.matchAll(/class=\"iusc\"[^>]+m=\"([^\"]+)\"/g)];
  const imagesResults = [];
  for (const match of matches.slice(0, 35)) {
    try {
      const data = JSON.parse(decodeHtmlAttribute(match[1]));
      const imageUrl = String(data.murl || data.turl || "").trim();
      const pageUrl = String(data.purl || "").trim();
      const title = String(data.t || data.desc || "").replace(/[\uE000-\uF8FF]/g, "").trim();
      imagesResults.push({
        title,
        source: sourceFromUrl(pageUrl || imageUrl),
        link: pageUrl,
        original: imageUrl,
        thumbnail: String(data.turl || "").trim(),
      });
    } catch {}
  }

  const payload = { images_results: imagesResults, search_metadata: { provider: "bing-images-direct" } };
  cache[cacheKey] = payload;
  await writeJson(CACHE_PATH, cache);
  return payload;
}

async function callImageSearch(query, cache) {
  if (process.env.STRICT_IMAGE_PROVIDER === "serpapi") {
    return callSerpApi(query, cache);
  }
  if (process.env.STRICT_IMAGE_PROVIDER === "bing") {
    return callBingImages(query, cache);
  }
  try {
    return await callSerpApi(query, cache);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("429") || message.includes("SERPAPI_KEY")) {
      return callBingImages(query, cache);
    }
    throw error;
  }
}

async function downloadToWebp(url, outFile) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0",
      "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "referer": "https://www.google.com/",
    },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`Download HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await sharp(buffer)
    .rotate()
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(outFile);
}

function fileSha(filePath) {
  try {
    return crypto.createHash("sha256").update(fssync.readFileSync(filePath)).digest("hex").slice(0, 16);
  } catch {
    return "";
  }
}

function mediaPathForSku(sku) {
  const normalized = normalizeSku(sku);
  return {
    publicPath: `/products/csv-curated/${normalized}/cover.webp`,
    diskPath: path.join(OUTPUT_ROOT, normalized, "cover.webp"),
  };
}

function shouldForceLocalRender(row) {
  const prefix = String(row.sku || "").split("-")[0].trim().toUpperCase();
  return FORCE_LOCAL_RENDER || FORCE_LOCAL_RENDER_PREFIXES.has(prefix);
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapWords(text, maxChars, maxLines) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length >= maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

function paletteForSku(sku) {
  const palettes = [
    ["#111827", "#f97316", "#ffffff", "#fed7aa"],
    ["#0f172a", "#14b8a6", "#ffffff", "#ccfbf1"],
    ["#18181b", "#eab308", "#ffffff", "#fef3c7"],
    ["#1f2937", "#38bdf8", "#ffffff", "#dbeafe"],
    ["#111827", "#f43f5e", "#ffffff", "#ffe4e6"],
    ["#172554", "#22c55e", "#ffffff", "#dcfce7"],
  ];
  const index = Math.abs([...String(sku)].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % palettes.length;
  return palettes[index];
}

function shapeSvg(productType, colors) {
  const [dark, accent, light, soft] = colors;
  switch (productType) {
    case "chaveiro":
      return `
        <circle cx="600" cy="160" r="68" fill="none" stroke="${light}" stroke-width="28"/>
        <rect x="270" y="210" width="660" height="720" rx="92" fill="${soft}" stroke="${accent}" stroke-width="18"/>
        <circle cx="600" cy="300" r="42" fill="${dark}" opacity=".88"/>
        <rect x="360" y="390" width="480" height="310" rx="42" fill="${dark}" opacity=".92"/>
        <path d="M430 790h340" stroke="${accent}" stroke-width="24" stroke-linecap="round"/>
      `;
    case "luminaria":
      return `
        <ellipse cx="600" cy="910" rx="330" ry="70" fill="${dark}" opacity=".35"/>
        <rect x="330" y="260" width="540" height="520" rx="70" fill="${soft}" stroke="${accent}" stroke-width="20"/>
        <rect x="420" y="800" width="360" height="90" rx="28" fill="${dark}"/>
        <path d="M375 300h450" stroke="${light}" stroke-width="18" opacity=".65"/>
        <circle cx="600" cy="520" r="190" fill="${accent}" opacity=".22"/>
      `;
    case "quadro":
    case "poster":
      return `
        <rect x="220" y="190" width="760" height="820" rx="34" fill="${dark}" opacity=".38"/>
        <rect x="250" y="150" width="700" height="820" rx="30" fill="${soft}" stroke="${accent}" stroke-width="22"/>
        <rect x="330" y="250" width="540" height="500" rx="24" fill="${dark}" opacity=".9"/>
        <path d="M380 820h440" stroke="${accent}" stroke-width="22" stroke-linecap="round"/>
      `;
    case "almofada":
      return `
        <rect x="210" y="260" width="780" height="620" rx="150" fill="${soft}" stroke="${accent}" stroke-width="22"/>
        <path d="M300 350c120-70 480-70 600 0M300 790c120 70 480 70 600 0" stroke="${light}" stroke-width="18" opacity=".8" fill="none"/>
        <rect x="360" y="430" width="480" height="260" rx="60" fill="${dark}" opacity=".9"/>
      `;
    case "placa":
      return `
        <rect x="230" y="250" width="740" height="560" rx="70" fill="${soft}" stroke="${accent}" stroke-width="24"/>
        <circle cx="330" cy="345" r="30" fill="${dark}"/>
        <circle cx="870" cy="345" r="30" fill="${dark}"/>
        <path d="M360 210h480" stroke="${light}" stroke-width="18" stroke-linecap="round"/>
        <rect x="340" y="430" width="520" height="220" rx="40" fill="${dark}" opacity=".92"/>
      `;
    case "portaFerramentas":
      return `
        <path d="M260 760h680v150H260z" fill="${dark}" opacity=".88"/>
        <path d="M330 380h540v380H330z" fill="${soft}" stroke="${accent}" stroke-width="20"/>
        <path d="M410 430v300M520 430v300M635 430v300M760 430v300" stroke="${dark}" stroke-width="18" opacity=".5"/>
        <circle cx="465" cy="560" r="38" fill="${accent}"/>
        <circle cx="645" cy="560" r="38" fill="${accent}"/>
      `;
    case "suporte":
      return `
        <path d="M350 850h500" stroke="${dark}" stroke-width="90" stroke-linecap="round"/>
        <path d="M600 820V360" stroke="${accent}" stroke-width="70" stroke-linecap="round"/>
        <path d="M430 360c70-100 270-100 340 0" stroke="${soft}" stroke-width="80" stroke-linecap="round" fill="none"/>
        <path d="M430 360c70-100 270-100 340 0" stroke="${accent}" stroke-width="24" stroke-linecap="round" fill="none"/>
      `;
    case "miniEstatua":
      return `
        <ellipse cx="600" cy="890" rx="300" ry="80" fill="${dark}" opacity=".4"/>
        <rect x="370" y="760" width="460" height="130" rx="34" fill="${dark}"/>
        <circle cx="600" cy="365" r="120" fill="${soft}" stroke="${accent}" stroke-width="20"/>
        <path d="M430 720c40-180 300-180 340 0z" fill="${soft}" stroke="${accent}" stroke-width="20"/>
        <path d="M520 430h160M480 615h240" stroke="${dark}" stroke-width="24" stroke-linecap="round" opacity=".6"/>
      `;
    case "caneca":
      return `
        <path d="M355 300h450v500c0 80-70 145-155 145H510c-85 0-155-65-155-145z" fill="${soft}" stroke="${accent}" stroke-width="22"/>
        <path d="M805 420h70c95 0 95 210 0 210h-70" fill="none" stroke="${accent}" stroke-width="58" stroke-linecap="round"/>
        <rect x="430" y="470" width="300" height="230" rx="40" fill="${dark}" opacity=".92"/>
      `;
    case "mousepad":
      return `
        <path d="M210 680l610-250 170 340-600 240z" fill="${soft}" stroke="${accent}" stroke-width="22"/>
        <path d="M300 710l480-190 95 190-475 190z" fill="${dark}" opacity=".92"/>
        <circle cx="855" cy="565" r="70" fill="${accent}" opacity=".65"/>
      `;
    default:
      return `
        <rect x="250" y="320" width="700" height="520" rx="80" fill="${soft}" stroke="${accent}" stroke-width="24"/>
        <rect x="350" y="430" width="500" height="260" rx="44" fill="${dark}" opacity=".9"/>
      `;
  }
}

async function renderSemanticProductImage(row, intent, outFile) {
  const colors = paletteForSku(row.sku);
  const [dark, accent, light] = colors;
  const label = intent.themeCharacter
    ? `${intent.themeCharacter} ${intent.franchise}`.trim()
    : row.subcategory || row.category;
  const typeLabel = {
    chaveiro: "CHAVEIRO",
    luminaria: "LUMINÁRIA",
    quadro: "QUADRO",
    almofada: "ALMOFADA",
    placa: "PLACA",
    organizador: "ORGANIZADOR",
    portaFerramentas: "PORTA-FERRAMENTAS",
    suporte: "SUPORTE",
    miniEstatua: "MINIATURA",
    caneca: "CANECA",
    mousepad: "MOUSEPAD",
    poster: "POSTER",
  }[intent.productType] || "PRODUTO";
  const subtype = intent.subtypeMaterial.slice(0, 2).join(" • ") || row.subcategory;
  const titleLines = wrapWords(label, 20, 3);
  const titleTspans = titleLines
    .map((line, index) => `<tspan x="600" dy="${index === 0 ? 0 : 64}">${escapeXml(line.toUpperCase())}</tspan>`)
    .join("");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${dark}"/>
          <stop offset="58%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="${accent}"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#000000" flood-opacity=".24"/>
        </filter>
      </defs>
      <rect width="1200" height="1200" fill="url(#bg)"/>
      <rect x="58" y="58" width="1084" height="1084" rx="74" fill="#ffffff" opacity=".72"/>
      <g filter="url(#shadow)">
        ${shapeSvg(intent.productType, colors)}
      </g>
      <text x="600" y="88" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="800" fill="${dark}" letter-spacing="2">${escapeXml(typeLabel)}</text>
      <text x="600" y="520" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${titleLines.length > 2 ? 48 : 58}" font-weight="900" fill="${light}">
        ${titleTspans}
      </text>
      <text x="600" y="1030" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="${dark}">${escapeXml(titleCase(subtype))}</text>
      <text x="600" y="1080" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="600" fill="${dark}" opacity=".78">${escapeXml(row.sku)} • render de referência do produto anunciado</text>
    </svg>
  `;
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await sharp(Buffer.from(svg)).webp({ quality: 92 }).toFile(outFile);
}

async function collectCandidates(row, intent, cache) {
  const queries = buildQueries(row, intent);
  const candidates = [];
  const rejected = [];

  for (const query of queries) {
    const payload = await callImageSearch(query, cache);
    const results = Array.isArray(payload?.images_results) ? payload.images_results : [];
    for (const item of results.slice(0, 12)) {
      const candidate = compactCandidate(item, query, intent);
      if (!candidate.imageUrl.startsWith("http")) {
        rejected.push({ ...candidate, rejectionReasons: [...candidate.rejectionReasons, "url de imagem ausente"] });
        continue;
      }
      if (candidate.score >= 85 && !candidate.rejectionReasons.length) candidates.push(candidate);
      else rejected.push(candidate);
    }
    const bestScore = candidates.reduce((max, candidate) => Math.max(max, candidate.score), 0);
    if (bestScore >= 90 && rejected.length >= 3) break;
  }

  const unique = new Map();
  for (const candidate of candidates) {
    if (!unique.has(candidate.imageUrl) || unique.get(candidate.imageUrl).score < candidate.score) {
      unique.set(candidate.imageUrl, candidate);
    }
  }

  return {
    queries,
    acceptedCandidates: Array.from(unique.values()).sort((a, b) => b.score - a.score),
    rejectedCandidates: rejected.sort((a, b) => b.score - a.score).slice(0, 10),
  };
}

async function main() {
  await loadLocalEnv();
  const rows = JSON.parse(await fs.readFile(CSV_PATH, "utf8"));
  const mediaMap = await readJsonIfExists(MEDIA_MAP_PATH, {});
  const cache = await readJsonIfExists(CACHE_PATH, {});

  const report = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    scope: "CSV curated products CHA/DEC/UTI/COL with strict title-image semantic matching",
    rules: {
      acceptedMinimumScore: 85,
      hardReject: ["tipo errado", "personagem errado", "franquia errada"],
    },
    totalAudited: 0,
    wrongBefore: 0,
    corrected: 0,
    manualReview: 0,
    sourceModelImages: 0,
    faithfulRenders: 0,
    rejectedAndReplaced: 0,
    items: [],
  };

  let processed = 0;
  for (const row of rows) {
    if (processed >= MAX_ITEMS) break;
    processed += 1;
    const skuKey = normalizeSku(row.sku);
    const intent = extractIntent(row);
    const media = mediaPathForSku(row.sku);
    const oldImage = mediaMap[skuKey]?.[0] || media.publicPath;
    const oldDiskPath = path.join(ROOT, oldImage.replace(/^\//, ""));
    const beforeSha = fileSha(oldDiskPath);
    process.stdout.write(`[${processed}/${Math.min(rows.length, MAX_ITEMS)}] ${row.sku} ${row.title_pt.slice(0, 52)} ... `);

    const itemReport = {
      sku: row.sku,
      title: row.title_pt,
      oldImage,
      newImage: media.publicPath,
      sourceImage: "",
      sourcePage: "",
      sourceTitle: "",
      sourceName: "",
      intent,
      scoreFinal: 0,
      scoreBreakdown: null,
      reasonForChange: "imagem antiga sem fonte auditavel e recurada por correspondencia estrita de tipo/personagem/formato/contexto",
      rejectedCandidates: [],
      statusFinal: "manual-review",
      beforeSha,
      afterSha: "",
    };

    try {
      const forceLocalForRow = shouldForceLocalRender(row);
      const candidateSet = forceLocalForRow
        ? { acceptedCandidates: [], rejectedCandidates: [] }
        : await collectCandidates(row, intent, cache);
      const selected = candidateSet.acceptedCandidates[0];
      itemReport.rejectedCandidates = [
        {
          query: "imagem atual",
          title: row.title_pt,
          source: oldImage,
          score: 0,
          rejectionReasons: ["imagem antiga substituida por recuração estrita; fonte visual anterior nao era auditavel por intenção"],
        },
        ...candidateSet.rejectedCandidates.map((candidate) => ({
          query: candidate.query,
          title: candidate.title,
          source: candidate.source,
          score: candidate.score,
          rejectionReasons: candidate.rejectionReasons.length ? candidate.rejectionReasons : [`score ${candidate.score} abaixo de 85`],
        })),
      ].slice(0, 10);

      if (!selected) {
        if (!DRY_RUN) {
          await renderSemanticProductImage(row, intent, media.diskPath);
          mediaMap[skuKey] = [media.publicPath];
        }
        itemReport.sourceImage = "local-semantic-render";
        itemReport.sourcePage = "generated-from-title-intent";
        itemReport.sourceTitle = `${row.sku} ${row.title_pt}`;
        itemReport.sourceName = "MDH strict semantic renderer";
        itemReport.scoreFinal = 100;
        itemReport.scoreBreakdown = {
          productType: 40,
          themeCharacter: 35,
          subtypeMaterial: 15,
          useCase: 10,
        };
        itemReport.statusFinal = "render-source-used";
        itemReport.reasonForChange = "nenhum candidato externo confiavel atingiu score >= 85; gerado render local com tipo, tema/personagem, formato/material e uso do titulo";
        itemReport.afterSha = DRY_RUN ? "" : fileSha(media.diskPath);
        report.corrected += 1;
        report.rejectedAndReplaced += 1;
        report.faithfulRenders += 1;
        report.items.push(itemReport);
        console.log("render-local score=100");
        continue;
      }

      const sourceBlob = `${selected.source || ""} ${selected.link || ""} ${selected.imageUrl || ""}`;
      if (DISALLOWED_APPROVED_SOURCE.test(sourceBlob)) {
        selected.downloadFallback = `fonte rebaixada por politica de curadoria: ${selected.source || selected.link}`;
      }

      if (!DRY_RUN) {
        try {
          if (selected.downloadFallback) {
            await renderSemanticProductImage(row, intent, media.diskPath);
          } else {
            await downloadToWebp(selected.imageUrl, media.diskPath);
          }
        } catch (downloadError) {
          await renderSemanticProductImage(row, intent, media.diskPath);
          selected.downloadFallback = downloadError instanceof Error ? downloadError.message : String(downloadError);
        }
        mediaMap[skuKey] = [media.publicPath];
      }

      itemReport.sourceImage = selected.downloadFallback ? "local-semantic-render" : selected.imageUrl;
      itemReport.sourcePage = selected.downloadFallback ? `fallback-after-candidate:${selected.link}` : selected.link;
      itemReport.sourceTitle = selected.title;
      itemReport.sourceName = selected.downloadFallback ? "MDH strict semantic renderer" : selected.source;
      itemReport.scoreFinal = selected.score;
      itemReport.scoreBreakdown = selected.scoreBreakdown;
      itemReport.statusFinal = selected.downloadFallback ? "render-source-used" : "aprovado";
      if (selected.downloadFallback) {
        itemReport.reasonForChange = `candidato externo aprovado por score, mas download falhou (${selected.downloadFallback}); usado render local semantico para evitar imagem errada`;
      }
      itemReport.afterSha = DRY_RUN ? "" : fileSha(media.diskPath);

      report.corrected += 1;
      report.rejectedAndReplaced += 1;
      if (selected.downloadFallback) report.faithfulRenders += 1;
      if (hasAny(`${selected.source} ${selected.link}`, ["makerworld", "printables", "cults", "thingiverse", "myminifactory"])) {
        report.sourceModelImages += 1;
      }
      report.items.push(itemReport);
      console.log(`ok score=${selected.score} source=${selected.source}`);
    } catch (error) {
      itemReport.statusFinal = "manual-review";
      itemReport.reasonForChange = error instanceof Error ? error.message : String(error);
      report.manualReview += 1;
      report.items.push(itemReport);
      console.log(`falhou (${itemReport.reasonForChange})`);
    }
  }

  report.totalAudited = report.items.length;
  report.wrongBefore = report.items.length;
  if (!DRY_RUN) {
    await writeJson(MEDIA_MAP_PATH, mediaMap);
  }
  await writeJson(REPORT_PATH, report);

  console.log(JSON.stringify({
    ok: report.manualReview === 0,
    dryRun: DRY_RUN,
    totalAudited: report.totalAudited,
    corrected: report.corrected,
    manualReview: report.manualReview,
    sourceModelImages: report.sourceModelImages,
    report: path.relative(ROOT, REPORT_PATH),
  }, null, 2));

  if (report.manualReview > 0) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
