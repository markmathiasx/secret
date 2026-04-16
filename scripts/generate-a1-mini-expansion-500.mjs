import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "a1-mini-expansion-500.json");
const MANIFEST = path.join(ROOT, "data", "catalog-photo-manifest.json");
const SNAPSHOT = path.join(ROOT, "data", "local-catalog-image-snapshot.json");
const REPORT = path.join(ROOT, "reports", "a1-mini-expansion-500-report.json");
const CACHE = path.join(ROOT, "reports", "a1-mini-expansion-serpapi-cache.json");
const IMAGE_ROOT = path.join(ROOT, "public", "products", "a1-mini-expansion");
const COST_PER_GRAM = 0.11;
const TARGET = 500;
const PRICE_LADDER = [12.9, 14.9, 17.9, 19.9, 22.9, 24.9, 27.9, 29.9, 34.9, 39.9, 44.9, 49.9, 59.9, 69.9, 79.9, 89.9, 99.9, 119.9, 139.9, 159.9];
const BLOCKED = [
  "gun", "rifle", "pistol", "nsfw", "sexy", "vape", "ashtray", "weapon", "bong", "knife", "blade",
  "pokemon", "pikachu", "charmander", "cubone", "mario", "zelda", "disney", "marvel", "star wars",
  "minecraft", "fortnite", "sonic", "dragon ball", "one piece", "naruto", "batman", "spider-man", "spiderman",
  "valorant", "league of legends",
];
const QUALIFIERS = ["Modular", "Compacto", "Slim", "Ajustável", "Dobrável", "de Encaixe", "de Bancada", "de Mesa", "Leve", "Minimalista", "Multiuso", "com Divisórias", "para Uso Diário", "de Produção Rápida", "Fácil de Limpar", "com Pegada Prática", "para Kit Presente", "com Acabamento Limpo", "para Rotina Organizada", "Versátil", "de Baixo Volume", "para Pequenos Espaços", "com Visual Neutro", "para Venda Rápida", "Prático", "Essencial", "Funcional", "com Apoio Estável"];
const UNIQUE_TAILS = ["com acesso rápido", "com corpo reforçado", "com frente baixa", "com perfil discreto", "para kits compactos", "para venda em lote", "com encaixe simples", "com uso intuitivo", "com base estável", "para gaveta rasa", "para bancada pequena", "com leitura visual limpa"];

const GROUPS = [
  ["Casa, Organização e Dia a Dia", "drawer-dividers", 18, "Utilidades Reais", "Organizadores de gaveta e divisórias", "drawer organizer divider 3d print", ["Organizador de Gaveta", "Divisória de Gaveta", "Bandeja Modular de Gaveta"], ["para talheres e peças pequenas", "para escritório e miudezas", "para cozinha e rotina"], [28, 88], 19.9],
  ["Casa, Organização e Dia a Dia", "home-cable-wraps", 18, "Utilidades Reais", "Organizadores de cabos e enroladores de fio", "cable organizer cord winder 3d print", ["Organizador de Cabos", "Enrolador de Fio", "Clipe Passa-Cabo"], ["para carregadores", "para mesa e gaveta", "para cabos de rotina"], [10, 42], 12.9],
  ["Casa, Organização e Dia a Dia", "wall-hooks-keyholders", 18, "Utilidades Reais", "Ganchos, suportes de parede e porta-chaves", "wall hook key holder 3d print", ["Gancho de Parede", "Porta-Chaves de Parede", "Suporte de Parede"], ["para entrada de casa", "para chaves e acessórios", "para organização leve"], [18, 70], 17.9],
  ["Casa, Organização e Dia a Dia", "kitchen-tools", 18, "Utilidades Reais", "Cozinha leve, clips, funis, suportes e utilidades", "kitchen clip funnel holder 3d print", ["Clipe de Cozinha", "Funil Compacto", "Suporte de Cozinha"], ["para embalagens", "para preparo rápido", "para bancada e armário"], [12, 58], 14.9],
  ["Casa, Organização e Dia a Dia", "bathroom-organizers", 14, "Utilidades Reais", "Banheiro, porta-escova, porta-creme e organização", "bathroom toothbrush toothpaste holder 3d print", ["Porta-Escova", "Porta-Creme Dental", "Organizador de Banheiro"], ["para bancada", "para pia e armário", "para rotina de higiene"], [24, 82], 19.9],
  ["Casa, Organização e Dia a Dia", "laundry-organizers", 10, "Utilidades Reais", "Lavanderia, prendedores, guias e organização", "laundry clip hanger guide 3d print", ["Organizador de Lavanderia", "Guia para Varal", "Suporte para Prendedores"], ["para área de serviço", "para varal e cabides", "para rotina doméstica"], [18, 66], 17.9],
  ["Casa, Organização e Dia a Dia", "small-boxes-trays", 18, "Utilidades Reais", "Caixas pequenas, bandejas e porta-objetos", "small box tray storage 3d print", ["Caixa Organizadora", "Bandeja Porta-Objetos", "Porta-Miudezas"], ["para mesa e gaveta", "para bijuterias e peças pequenas", "para entrada de casa"], [28, 95], 19.9],
  ["Casa, Organização e Dia a Dia", "general-home-holders", 26, "Utilidades Reais", "Suportes domésticos diversos e utilidades gerais", "home utility holder 3d print", ["Suporte Doméstico", "Organizador Multiuso", "Apoio Compacto"], ["para uso diário", "para armário e bancada", "para resolver pequenas rotinas"], [16, 90], 17.9],
  ["Setup, Escritório e Home Office", "phone-stands", 12, "Setup & Organização", "Suporte de celular", "phone stand 3d print", ["Suporte para Celular", "Base para Smartphone", "Dock de Celular"], ["para mesa", "para videochamada", "para carregamento"], [22, 78], 19.9],
  ["Setup, Escritório e Home Office", "tablet-stands", 8, "Setup & Organização", "Suporte de tablet", "tablet stand 3d print", ["Suporte para Tablet", "Base de Tablet", "Apoio para iPad"], ["para mesa de trabalho", "para leitura e vídeo", "para apoio compacto"], [42, 120], 27.9],
  ["Setup, Escritório e Home Office", "headset-stands", 10, "Setup & Organização", "Suporte de headset/fone", "headset stand headphone holder 3d print", ["Suporte para Headset", "Gancho para Fone", "Base para Headphone"], ["para setup gamer", "para lateral da mesa", "para home office"], [30, 110], 24.9],
  ["Setup, Escritório e Home Office", "controller-docks", 10, "Setup & Organização", "Suporte de controle e dock simples", "game controller stand dock 3d print", ["Suporte para Controle", "Dock para Controle", "Base Gamer Compacta"], ["para setup", "para console e mesa", "para organizar controles"], [30, 105], 24.9],
  ["Setup, Escritório e Home Office", "desk-pen-organizers", 12, "Setup & Organização", "Organização de mesa e porta-canetas", "desk organizer pen holder 3d print", ["Porta-Canetas", "Organizador de Mesa", "Porta-Lápis Modular"], ["para escritório", "para estudo", "para mesa limpa"], [34, 110], 22.9],
  ["Setup, Escritório e Home Office", "desk-cable-chargers", 10, "Setup & Organização", "Organização de cabos e carregadores", "charger cable organizer desk 3d print", ["Organizador de Carregador", "Passa-Cabo de Mesa", "Dock de Cabos"], ["para carregadores", "para mesa de trabalho", "para setup limpo"], [14, 58], 17.9],
  ["Setup, Escritório e Home Office", "notebook-accessories", 8, "Setup & Organização", "Suporte de notebook/acessórios desk", "laptop stand desk accessory 3d print", ["Suporte para Notebook", "Elevador de Notebook", "Apoio Desk"], ["para home office", "para ventilação e ergonomia", "para bancada compacta"], [55, 145], 34.9],
  ["Setup, Escritório e Home Office", "small-electronics-stands", 10, "Setup & Organização", "Stand para relógio, óculos, cartões e pequenos eletrônicos", "watch glasses card stand 3d print", ["Stand para Relógio", "Porta-Óculos", "Organizador de Cartões"], ["para mesa e criado", "para acessórios pessoais", "para pequenos eletrônicos"], [20, 82], 19.9],
  ["Setup, Escritório e Home Office", "keyboard-monitor-accessories", 10, "Setup & Organização", "Acessórios para teclado, mouse, webcam e monitor", "keyboard mouse webcam monitor accessory 3d print", ["Acessório de Teclado", "Suporte de Webcam", "Organizador de Mouse"], ["para setup", "para monitor e mesa", "para produtividade"], [12, 68], 17.9],
  ["Oficina, Ferramentas e Acessórios", "drill-bit-holders", 10, "Utilidades Reais", "Suporte de brocas e bits", "drill bit holder organizer 3d print", ["Suporte de Brocas", "Organizador de Bits", "Porta-Brocas Compacto"], ["para bancada maker", "para oficina leve", "para gaveta de ferramentas"], [24, 92], 22.9],
  ["Oficina, Ferramentas e Acessórios", "allen-key-organizers", 10, "Utilidades Reais", "Organizadores de chaves Allen e chaves pequenas", "allen key wrench organizer 3d print", ["Organizador de Chaves Allen", "Porta-Chaves Pequenas", "Suporte de Ferramentas Mini"], ["para bancada", "para kit maker", "para gaveta técnica"], [18, 76], 19.9],
  ["Oficina, Ferramentas e Acessórios", "clamps-clips-locks", 14, "Utilidades Reais", "Braçadeiras, presilhas e travas impressas", "clamp clip latch 3d print", ["Presilha Impressa", "Trava Compacta", "Braçadeira Leve"], ["para fixação leve", "para organização técnica", "para bancada e cabos"], [8, 44], 12.9],
  ["Oficina, Ferramentas e Acessórios", "technical-cable-guides", 14, "Utilidades Reais", "Guia de cabo, passador, clip técnico e fixação leve", "cable guide wire clip technical 3d print", ["Guia de Cabo Técnico", "Passador de Fio", "Clipe Técnico"], ["para bancada maker", "para fixação leve", "para organização de fios"], [8, 42], 12.9],
  ["Oficina, Ferramentas e Acessórios", "bench-tool-holders", 12, "Utilidades Reais", "Suporte de bancada e porta-ferramentas leves", "workbench tool holder 3d print", ["Porta-Ferramentas de Bancada", "Suporte de Bancada", "Organizador Maker"], ["para ferramentas leves", "para bancada de trabalho", "para manutenção simples"], [35, 125], 27.9],
  ["Oficina, Ferramentas e Acessórios", "technical-boxes", 10, "Utilidades Reais", "Caixas técnicas pequenas e divisórias funcionais", "small parts box divider 3d print", ["Caixa Técnica", "Estojo de Peças", "Divisória Funcional"], ["para parafusos e componentes", "para bancada maker", "para kits pequenos"], [28, 110], 22.9],
  ["Oficina, Ferramentas e Acessórios", "maker-bench-accessories", 10, "Utilidades Reais", "Acessórios de oficina maker e bancada", "maker bench accessory 3d print", ["Acessório de Bancada Maker", "Suporte Maker Compacto", "Organizador de Oficina Leve"], ["para rotina maker", "para bancada compacta", "para impressão 3D e ferramentas"], [18, 96], 19.9],
  ["Geek, Gamer, Retrô e Decoração", "generic-geek-minis", 20, "Geek & Colecionáveis", "Miniaturas geek genéricas imprimíveis", "generic geek miniature 3d print", ["Miniatura Geek", "Figura Decorativa", "Colecionável de Mesa"], ["para estante", "para setup", "para presente geek neutro"], [18, 82], 19.9],
  ["Geek, Gamer, Retrô e Decoração", "neutral-gamer-decor", 15, "Geek & Colecionáveis", "Decoração gamer neutra de setup/quarto", "gamer room decor 3d print", ["Decoração Gamer", "Adorno de Setup", "Peça Decorativa Gamer"], ["para quarto e setup", "para mesa gamer", "para estante"], [18, 95], 22.9],
  ["Geek, Gamer, Retrô e Decoração", "keycaps-desk-decor", 10, "Geek & Colecionáveis", "Keycaps, adornos e desk decor geek", "keycap desk decor 3d print", ["Keycap Decorativa", "Adorno Geek de Mesa", "Desk Decor Compacto"], ["para teclado e setup", "para mesa geek", "para detalhe visual"], [6, 36], 12.9],
  ["Geek, Gamer, Retrô e Decoração", "geek-gamer-keychains", 15, "Presentes Criativos", "Chaveiros geek e gamer", "geek gamer keychain 3d print", ["Chaveiro Geek", "Chaveiro Gamer", "Pingente de Mochila"], ["para presente rápido", "para mochila e chave", "para brinde geek"], [6, 28], 12.9],
  ["Geek, Gamer, Retrô e Decoração", "fidgets-desk-toys", 10, "Geek & Colecionáveis", "Articulados simples, desk toys e fidgets", "fidget desk toy articulated 3d print", ["Fidget de Mesa", "Desk Toy Articulado", "Brinquedo de Mesa"], ["para mesa e presente", "para relaxar no setup", "para brinde criativo"], [12, 58], 17.9],
  ["Geek, Gamer, Retrô e Decoração", "retro-geek-plaques", 10, "Geek & Colecionáveis", "Placas, suportes e decoração retro/geek", "retro geek plaque stand 3d print", ["Placa Retrô Geek", "Suporte Decorativo Retrô", "Decoração Geek de Parede"], ["para quarto e estante", "para setup retrô", "para presente nerd"], [18, 92], 22.9],
  ["Presentes, Personalizados e Brindes", "name-signs", 12, "Presentes Criativos", "Nome 3D, placas de nome e letreiros", "custom name sign 3d print", ["Nome 3D Personalizado", "Placa de Nome", "Letreiro de Mesa"], ["para quarto e porta", "para presente personalizado", "para mesa e evento"], [20, 95], 24.9],
  ["Presentes, Personalizados e Brindes", "personalized-keychains", 12, "Presentes Criativos", "Chaveiros personalizados", "custom name keychain 3d print", ["Chaveiro Personalizado", "Chaveiro com Nome", "Pingente Personalizado"], ["para lembrança", "para evento", "para presente rápido"], [6, 30], 12.9],
  ["Presentes, Personalizados e Brindes", "simple-giveaways", 12, "Presentes Criativos", "Lembranças e brindes simples", "party favor giveaway 3d print", ["Lembrança 3D", "Brinde Simples", "Mini Presente Personalizável"], ["para festa e evento", "para marca e turma", "para kit promocional"], [8, 42], 12.9],
  ["Presentes, Personalizados e Brindes", "photo-frames-tags", 12, "Presentes Criativos", "Porta-retrato, tags e itens de presente", "photo frame tag gift 3d print", ["Porta-Retrato 3D", "Tag de Presente", "Marcador Personalizável"], ["para presente", "para lembrança afetiva", "para embalagem especial"], [10, 82], 17.9],
  ["Presentes, Personalizados e Brindes", "seasonal-gifts", 12, "Presentes Criativos", "Itens sazonais/comemorativos vendáveis", "seasonal holiday gift 3d print", ["Enfeite Comemorativo", "Presente Sazonal", "Lembrança de Data Especial"], ["para datas comemorativas", "para mesa e decoração", "para presente temático"], [10, 70], 17.9],
  ["Pets, Kids, Hobby e Criativo", "pet-light-items", 10, "Utilidades Reais", "Itens leves para pets", "pet accessory tag bowl clip 3d print", ["Acessório Leve para Pet", "Tag para Pet", "Clipe Organizador Pet"], ["para identificação", "para rotina do pet", "para pote e guia"], [8, 48], 14.9],
  ["Pets, Kids, Hobby e Criativo", "kids-study-organization", 10, "Utilidades Reais", "Organização infantil e estudo", "kids desk organizer study 3d print", ["Organizador Infantil", "Porta-Lápis de Estudo", "Apoio de Mesa Infantil"], ["para estudo", "para quarto infantil", "para materiais escolares"], [18, 82], 19.9],
  ["Pets, Kids, Hobby e Criativo", "boardgame-hobby-accessories", 10, "Utilidades Reais", "Hobby, mesa, boardgame e acessórios criativos", "board game accessory tray 3d print", ["Acessório de Boardgame", "Bandeja de Dados", "Organizador de Peças de Jogo"], ["para mesa de jogo", "para RPG e boardgame", "para hobby criativo"], [12, 72], 17.9],
  ["Pets, Kids, Hobby e Criativo", "craft-hobby-organizers", 10, "Utilidades Reais", "Organizadores de hobby e artesanato", "craft organizer hobby 3d print", ["Organizador de Artesanato", "Porta-Ferramentas de Hobby", "Bandeja Criativa"], ["para artesanato", "para pintura e hobby", "para peças pequenas"], [18, 88], 19.9],
  ["Pets, Kids, Hobby e Criativo", "educational-small-items", 10, "Presentes Criativos", "Pequenos itens lúdicos e educativos imprimíveis", "educational toy puzzle 3d print", ["Item Educativo 3D", "Quebra-Cabeça Lúdico", "Brinquedo Educativo Compacto"], ["para estudo e presente", "para atividade criativa", "para brincadeira guiada"], [12, 70], 17.9],
].map(([niche, key, count, category, subcategory, query, objects, uses, grams, floor]) => ({ niche, key, count, category, subcategory, query, objects, uses, grams, floor }));

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, "utf8")); } catch (error) { if (error?.code === "ENOENT") return fallback; throw error; }
}
async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
function envFrom(text) {
  return Object.fromEntries(String(text).split(/\r?\n/).map((line) => line.match(/^([^#=]+)=(.*)$/)).filter(Boolean).map((m) => [m[1].trim(), m[2].trim().replace(/^['"]|['"]$/g, "")]));
}
async function loadEnv() {
  try {
    const env = envFrom(await fs.readFile(path.join(ROOT, ".env.local"), "utf8"));
    for (const [key, value] of Object.entries(env)) if (!process.env[key]) process.env[key] = value;
  } catch (error) { if (error?.code !== "ENOENT") throw error; }
}
function normalize(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function slugify(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}
function hash(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h >>> 0);
}
function money(value) {
  return Number(value.toFixed(2));
}
function commercialCeil(value) {
  return PRICE_LADDER.find((price) => price >= value) || money(Math.ceil(value / 10) * 10 - 0.1);
}
function gramsFor(group, title, index) {
  const explicit = String(title || "").match(/(?:^|\D)(\d{1,3})\s*g(?:\D|$)/i);
  if (explicit) {
    const grams = Number(explicit[1]);
    if (Number.isFinite(grams) && grams >= 4 && grams <= 180) return grams;
  }
  const [min, max] = group.grams;
  return min + (hash(`${group.key}:${title}:${index}`) % (max - min + 1));
}
function pricingFor(grams, group) {
  const filamentCostBrl = money(grams * COST_PER_GRAM);
  const minimumSalePriceBrl = money(filamentCostBrl * 1.3);
  const operationalTarget = money(filamentCostBrl * 4.2 + Math.max(5, grams * 0.08));
  return { filamentCostBrl, minimumSalePriceBrl, finalPriceBrl: commercialCeil(Math.max(minimumSalePriceBrl, group.floor, operationalTarget)) };
}
function hoursFor(grams) {
  return Number(Math.max(0.35, Math.min(7.5, grams / 28)).toFixed(1));
}
function dimensionsFor(group, grams) {
  if (/tablet|notebook|laptop/.test(group.key)) return "14x10x4cm";
  if (/drawer|box|tray|organizer/.test(group.key)) return grams < 28 ? "8x6x3cm" : "14x9x5cm";
  if (/keychain|tag/.test(group.key)) return "6x4x0.6cm";
  if (/wall|hook/.test(group.key)) return "9x5x4cm";
  if (/mini|decor|toy|fidget/.test(group.key)) return "8x6x6cm";
  return grams < 28 ? "7x5x2cm" : "11x7x5cm";
}
function cleanTitle(title) {
  return String(title || "").replace(/\s*-\s*Free 3D Print Model\s*-\s*MakerWorld/gi, "").replace(/\s*-\s*MakerWorld/gi, "").replace(/\s+by\s+[^-]+$/i, "").replace(/\s+/g, " ").trim();
}
function qualifier(title, index) {
  const t = normalize(title);
  if (t.includes("fold")) return "Dobrável";
  if (t.includes("adjust")) return "Ajustável";
  if (t.includes("modular")) return "Modular";
  if (t.includes("gridfinity")) return "Gridfinity";
  if (t.includes("mini")) return "Mini";
  if (t.includes("wall")) return "de Parede";
  if (t.includes("desk")) return "de Mesa";
  if (t.includes("clip")) return "com Clipe";
  if (t.includes("magnet")) return "com Ímã";
  if (t.includes("stack")) return "Empilhável";
  return QUALIFIERS[index % QUALIFIERS.length];
}
function nameFor(group, candidate, index) {
  const object = group.objects[index % group.objects.length];
  let q = qualifier(candidate.title, index);
  const objectKey = normalize(object);
  if (
    (objectKey.includes("parede") && /de Parede|de Bancada|de Mesa/.test(q)) ||
    (objectKey.includes("mesa") && q === "de Mesa") ||
    (objectKey.includes("bancada") && q === "de Bancada") ||
    (objectKey.includes("compacto") && q === "Compacto") ||
    (objectKey.includes("modular") && q === "Modular") ||
    (objectKey.includes("mini") && q === "Mini") ||
    (objectKey.includes("multiuso") && q === "Multiuso") ||
    (objectKey.includes("clipe") && q === "com Clipe")
  ) {
    q = QUALIFIERS[(index + 11) % QUALIFIERS.length];
  }
  return `${object} ${q} ${group.uses[index % group.uses.length]}`
    .replace(/\b(Modular|Compacto|Slim|Ajustável|Dobrável|Leve|Minimalista|Multiuso|Prático|Essencial|Funcional)\s+\1\b/g, "$1")
    .replace(/\b(Mini)\s+\1\b/g, "$1")
    .replace(/\bde Parede\s+de Parede\b/g, "de Parede")
    .replace(/\bde Mesa\s+de Mesa\b/g, "de Mesa")
    .replace(/\bde Bancada\s+de Bancada\b/g, "de Bancada")
    .replace(/\s+/g, " ")
    .trim();
}
function tagsFor(group) {
  return Array.from(new Set(["bambu-lab-a1-mini", "makerworld", "pla", "expansao-500", "sob-encomenda", "produto-fdm", group.niche, group.subcategory, ...group.objects]));
}
function validCandidate(result) {
  const title = String(result?.title || "");
  const link = String(result?.link || "");
  const original = String(result?.original || "");
  const source = String(result?.source || "");
  const t = normalize(title);
  return title && link.includes("makerworld.com/en/models") && original.startsWith("http") && original.includes("makerworld.bblmw.com") && (source.toLowerCase().includes("makerworld") || link.includes("makerworld.com")) && !BLOCKED.some((term) => t.includes(term));
}
async function searchImages(query, page, cache) {
  const key = `${query}::${page}`;
  if (cache[key]) return cache[key];
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SERPAPI_KEY não encontrado em .env.local");
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_images");
  url.searchParams.set("google_domain", "google.com");
  url.searchParams.set("gl", "br");
  url.searchParams.set("hl", "pt-br");
  url.searchParams.set("safe", "active");
  url.searchParams.set("ijn", String(page));
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", apiKey);
  const response = await fetch(url, { headers: { accept: "application/json", "user-agent": "mdh-a1-mini-expansion/1.0" } });
  if (!response.ok) throw new Error(`SerpAPI HTTP ${response.status} para ${query}`);
  const payload = await response.json();
  cache[key] = Array.isArray(payload.images_results) ? payload.images_results : [];
  await writeJson(CACHE, cache);
  return cache[key];
}
async function collect(group, cache, usedLinks, usedImages) {
  const queries = [`site:makerworld.com/en/models ${group.query}`, `site:makerworld.com/en/models ${group.query} A1 Mini`, `site:makerworld.com/en/models ${group.query} PLA`];
  const candidates = [];
  const localLinks = new Set();
  for (const query of queries) {
    for (let page = 0; page < 3; page += 1) {
      for (const result of await searchImages(query, page, cache)) {
        if (!validCandidate(result)) continue;
        const link = String(result.link);
        const original = String(result.original);
        if (usedLinks.has(link) || usedImages.has(original) || localLinks.has(link)) continue;
        localLinks.add(link);
        candidates.push({ title: cleanTitle(result.title), sourceTitle: cleanTitle(result.title), sourceProductLink: link, sourceImageUrl: original, sourceThumbnailUrl: String(result.thumbnail || "") });
      }
      if (candidates.length >= group.count * 4) return candidates;
    }
  }
  return candidates;
}
async function downloadImage(url, out) {
  try {
    const existing = await sharp(out).metadata();
    if (existing.width && existing.height && existing.width >= 220 && existing.height >= 220) return existing;
  } catch {
    // File does not exist yet or is not a valid image; download below.
  }
  const optimizedUrl = url.includes("makerworld.bblmw.com") && !url.includes("x-oss-process=")
    ? `${url}${url.includes("?") ? "&" : "?"}x-oss-process=image/resize,w_900/format,webp`
    : url;
  const response = await fetch(optimizedUrl, { headers: { accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8", referer: "https://makerworld.com/", "user-agent": "Mozilla/5.0" }, redirect: "follow" });
  if (!response.ok) throw new Error(`download HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height || metadata.width < 220 || metadata.height < 220) throw new Error(`imagem inválida ${metadata.width}x${metadata.height}`);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await sharp(buffer).rotate().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toFile(out);
  return sharp(out).metadata();
}
function recordFor(group, candidate, globalIndex, groupIndex, existingSlugs, usedSlugs, usedNames) {
  const id = `mw-a1-${String(globalIndex).padStart(3, "0")}`;
  const sku = `MW-A1-${String(globalIndex).padStart(3, "0")}`;
  let name = nameFor(group, candidate, groupIndex);
  let nameKey = normalize(name);
  let uniqueAttempt = 0;
  while (usedNames.has(nameKey)) {
    name = `${nameFor(group, candidate, groupIndex)} ${UNIQUE_TAILS[(globalIndex + uniqueAttempt) % UNIQUE_TAILS.length]}`;
    nameKey = normalize(name);
    uniqueAttempt += 1;
  }
  usedNames.add(nameKey);
  let slug = slugify(name);
  if (existingSlugs.has(slug) || usedSlugs.has(slug)) slug = `${slug}-${id}`;
  usedSlugs.add(slug);
  const estimatedGrams = gramsFor(group, candidate.sourceTitle, globalIndex);
  const prices = pricingFor(estimatedGrams, group);
  const image = `/products/a1-mini-expansion/${id}/cover.webp`;
  return {
    id, sku, slug, name,
    sourceTitle: candidate.sourceTitle, sourceProductLink: candidate.sourceProductLink, sourceImageUrl: candidate.sourceImageUrl, sourceThumbnailUrl: candidate.sourceThumbnailUrl,
    niche: group.niche, nicheKey: group.key, category: group.category, subcategory: group.subcategory, collection: `A1 Mini MakerWorld • ${group.niche}`,
    shortDescription: `${name} impresso em PLA para resolver organização, apoio ou presente de forma simples, compacta e fácil de entender na primeira olhada.`,
    longDescription: `${name} foi selecionado para a linha Bambu Lab A1 Mini por combinar baixo volume, utilidade clara e boa leitura visual no catálogo. É uma peça sob encomenda para uso diário, setup, presente ou organização leve, com consumo estimado de ${estimatedGrams}g de PLA e preço Pix de R$ ${prices.finalPriceBrl.toFixed(2).replace(".", ",")} calculado a partir do peso de filamento e acabamento comercial.`,
    estimatedGrams, filamentCostBrl: prices.filamentCostBrl, minimumSalePriceBrl: prices.minimumSalePriceBrl, finalPriceBrl: prices.finalPriceBrl,
    hours: hoursFor(estimatedGrams), dimensions: dimensionsFor(group, estimatedGrams), image, images: [image], tags: tagsFor(group),
    material: "PLA Premium", finish: group.category === "Geek & Colecionáveis" || group.category === "Presentes Criativos" ? "Premium" : "Texturizado",
    productionWindow: estimatedGrams > 100 ? "4 a 7 dias" : "3 a 5 dias",
    customizable: /custom|name|nome|keychain|sign|placa|letreiro/i.test(`${group.key} ${group.subcategory} ${candidate.sourceTitle}`),
    commercialLicensePriority: "MakerWorld como fonte principal; revisar licença comercial do arquivo antes de produzir em escala.",
    imageStatus: "validada-localmente",
    pricingPreset: "PLA • Bambu Lab A1 Mini • 0.20mm • nozzle padrão • infill comercial consistente",
  };
}
async function main() {
  await loadEnv();
  const expected = GROUPS.reduce((sum, group) => sum + group.count, 0);
  if (expected !== TARGET) throw new Error(`Distribuição inválida: ${expected}`);
  const snapshot = await readJson(SNAPSHOT, []);
  const oldCatalogTotal = Array.isArray(snapshot) ? snapshot.length : 0;
  const existingSlugs = new Set(Array.isArray(snapshot) ? snapshot.flatMap((item) => [item.slug, item.slug?.replace(/^[a-z]+-\d+-/, ""), slugify(item.name || "")]).filter(Boolean) : []);
  const cache = await readJson(CACHE, {});
  const usedLinks = new Set();
  const usedImages = new Set();
  const usedSlugs = new Set();
  const usedNames = new Set();
  const products = [];
  const failures = [];
  for (const group of GROUPS) {
    const candidates = await collect(group, cache, usedLinks, usedImages);
    let added = 0;
    for (const candidate of candidates) {
      if (added >= group.count) break;
      const record = recordFor(group, candidate, products.length + 1, added, existingSlugs, usedSlugs, usedNames);
      try {
        const metadata = await downloadImage(candidate.sourceImageUrl, path.join(IMAGE_ROOT, record.id, "cover.webp"));
        record.localImageWidth = metadata.width;
        record.localImageHeight = metadata.height;
        products.push(record);
        usedLinks.add(candidate.sourceProductLink);
        usedImages.add(candidate.sourceImageUrl);
        added += 1;
        console.log(`[${products.length}/${TARGET}] ${record.sku} ${record.name}`);
      } catch (error) {
        failures.push({ group: group.key, sourceProductLink: candidate.sourceProductLink, sourceImageUrl: candidate.sourceImageUrl, error: error instanceof Error ? error.message : String(error) });
      }
    }
    if (added !== group.count) throw new Error(`Grupo ${group.key} incompleto: ${added}/${group.count}. Falhas: ${failures.length}`);
  }
  const ids = new Set(products.map((p) => p.id));
  const slugs = new Set(products.map((p) => p.slug));
  const sourceLinks = new Set(products.map((p) => p.sourceProductLink));
  const imagePaths = new Set(products.map((p) => p.image));
  if (products.length !== TARGET || ids.size !== TARGET || slugs.size !== TARGET || sourceLinks.size !== TARGET || imagePaths.size !== TARGET) throw new Error("Validação de unicidade falhou");
  await writeJson(OUT, products);
  const manifest = await readJson(MANIFEST, []);
  const withoutExpansion = Array.isArray(manifest) ? manifest.filter((entry) => !ids.has(entry.id)) : [];
  await writeJson(MANIFEST, [...withoutExpansion, ...products.map((p) => ({ id: p.id, name: p.name, sourceFilename: `a1-mini-expansion/${p.id}/cover.webp`, kind: "render-fiel", gallery: [p.image] }))]);
  const byNiche = products.reduce((acc, p) => ({ ...acc, [p.niche]: (acc[p.niche] || 0) + 1 }), {});
  const bySubcategory = products.reduce((acc, p) => ({ ...acc, [p.subcategory]: (acc[p.subcategory] || 0) + 1 }), {});
  await writeJson(REPORT, {
    generatedAt: new Date().toISOString(),
    source: "MakerWorld via SerpAPI Google Images results",
    oldCatalogTotal,
    expectedFinalCatalogTotal: oldCatalogTotal + TARGET,
    totalNewProducts: products.length,
    byNiche,
    bySubcategory,
    uniqueSlugs: slugs.size,
    uniqueSourceLinks: sourceLinks.size,
    uniqueImagePaths: imagePaths.size,
    pricingFormula: {
      filamentCostPerKgBrl: 110,
      filamentCostPerGramBrl: COST_PER_GRAM,
      filamentCostBrl: "estimatedGrams * 0.11",
      minimumSalePriceBrl: "filamentCostBrl * 1.30",
      finalPriceBrl: "commercial ladder ceil(max(minimumSalePriceBrl, category floor, filamentCostBrl * 4.2 + handling by grams))",
    },
    items: products.map(({ id, sku, slug, name, niche, subcategory, estimatedGrams, filamentCostBrl, minimumSalePriceBrl, finalPriceBrl, image, imageStatus, sourceProductLink, sourceTitle }) => ({ id, sku, slug, name, niche, subcategory, estimatedGrams, filamentCostBrl, minimumSalePriceBrl, finalPriceBrl, image, imageStatus, sourceProductLink, sourceTitle })),
    failures,
  });
  console.log(JSON.stringify({ oldCatalogTotal, added: products.length, expectedFinal: oldCatalogTotal + TARGET, byNiche }, null, 2));
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
