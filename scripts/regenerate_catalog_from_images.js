const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const imgDir = path.join(root, 'catalog-assets');
const outFile = path.join(root, 'data', 'products.json');

const files = fs.readdirSync(imgDir).filter((f) => {
  const l = f.toLowerCase();
  return (l.endsWith('.webp') || l.endsWith('.jpg') || l.endsWith('.jpeg') || l.endsWith('.png'))
    && !l.includes('placeholder');
});

function toTitleCase(str) {
  return str
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

function hashBasedPrice(seed) {
  // deterministic pseudo-random price based on seed string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const base = 30 + (hash % 130);
  return base;
}

function normalizeLegacyPixPrice(pricePix) {
  const value = Number(pricePix);
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value <= 10) return Number(value.toFixed(2));
  return Number(Math.max(4.5, value * (4.5 / 24.5)).toFixed(2));
}

const products = files.map((file) => {
  const id = path.basename(file, path.extname(file));
  const title = toTitleCase(id);
  const precoPix = normalizeLegacyPixPrice(Math.round(hashBasedPrice(id)));
  const precoParcelado = Number((precoPix + 1).toFixed(2));
  const category = title.includes('Kitty') ? 'Colecionáveis' : 'Home Decor';
  const material = title.includes('Kitty') ? 'PLA' : 'PLA Silk';
  const tags = [category, material, 'Pronta entrega'];

  return {
    id,
    nome: title,
    descricao: `Peça impressa em 3D: ${title}. Produzida localmente com acabamento profissional e pronta para envio.`,
    categoria: category,
    colecao: 'Pronta entrega',
    material,
    acabamento: 'Gloss',
    prazo: '24h a 48h',
    tempoImpressao: '5h',
    peso: 80,
    precoPix,
    precoParcelado,
    parcelas: 12,
    disponivel: true,
    tags,
    imagem: `catalog-assets/${file}`,
  };
});

fs.writeFileSync(outFile, JSON.stringify(products, null, 2), 'utf-8');
console.log(`Wrote ${products.length} products to ${outFile}`);
