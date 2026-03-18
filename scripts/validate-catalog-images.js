#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '../lib/catalog.ts');
const catalogAssetsPath = path.resolve(__dirname, '../catalog-assets');

console.log('\n📋 VALIDAÇÃO DE CATÁLOGO + IMAGENS\n');
console.log('='.repeat(60));

// 1. Parse catalog.ts to extract all products
const catalogContent = fs.readFileSync(catalogPath, 'utf8');

// Extract all product IDs and image paths using regex
const productRegex = /id:\s*["']([^"']+)["'][^}]*?image:\s*["']([^"']+)["']/gs;
const products = [];
let match;

while ((match = productRegex.exec(catalogContent)) !== null) {
  products.push({
    id: match[1],
    imagePath: match[2]
  });
}

console.log(`\n✅ Total de produtos no catálogo: ${products.length}`);

// 2. Get all image files in catalog-assets
const imageFiles = fs.readdirSync(catalogAssetsPath)
  .filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f))
  .map(f => f.toLowerCase());

console.log(`✅ Total de imagens em catalog-assets: ${imageFiles.length}`);

// 3. Validate each product
const missing = [];
const invalid = [];
const valid = [];

products.forEach((product, idx) => {
  const imageName = product.imagePath.split('/').pop().toLowerCase();
  
  // Try exact match and normalized match (without leading zeros)
  const exact = imageFiles.includes(imageName);
  const normalized = imageFiles.includes(imageName.replace(/mdh-0+(\d+)/, 'mdh-$1'));
  
  if (exact || normalized) {
    valid.push({ ...product, found: imageName });
  } else if (!product.imagePath || product.imagePath === '' || product.imagePath === 'undefined') {
    missing.push({ ...product, reason: 'Nenhuma imagem definida' });
  } else {
    invalid.push({ ...product, attempted: imageName });
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\n✅ PRODUTOS COM IMAGEM VÁLIDA: ${valid.length}`);
console.log(`⚠️  PRODUTOS SEM IMAGEM: ${missing.length}`);
console.log(`❌ PRODUTOS COM IMAGEM INVÁLIDA/NÃO ENCONTRADA: ${invalid.length}`);

if (missing.length > 0) {
  console.log('\n⚠️  PRODUTOS SEM IMAGEM DEFINIDA:');
  console.log('-'.repeat(60));
  missing.forEach((p, i) => {
    console.log(`${i + 1}. ID: ${p.id} | Nome: ${p.id}`);
  });
}

if (invalid.length > 0) {
  console.log('\n❌ PRODUTOS COM IMAGEM NÃO ENCONTRADA:');
  console.log('-'.repeat(60));
  invalid.slice(0, 20).forEach((p, i) => {
    console.log(`${i + 1}. ID: ${p.id}`);
    console.log(`   🔍 Procurando: ${p.attempted}`);
    console.log(`   ❌ Não encontrado em catalog-assets/\n`);
  });
  if (invalid.length > 20) {
    console.log(`   ... e mais ${invalid.length - 20} produtos\n`);
  }
}

console.log('='.repeat(60));

// 4. Summary
const passRate = Math.round((valid.length / products.length) * 100);
console.log(`\n📊 TAXA DE SUCESSO: ${passRate}% (${valid.length}/${products.length})`);

if (passRate === 100) {
  console.log('✅ PERFEITO! Todos os produtos têm imagens válidas.');
} else if (passRate >= 90) {
  console.log('⚠️  BOM! Quase tudo pronto, mas há alguns produtos a revisar.');
} else {
  console.log('❌ CRÍTICO! Muitos produtos ainda não têm imagens válidas.');
}

console.log('\n' + '='.repeat(60) + '\n');

// 5. Generate report file
const report = {
  timestamp: new Date().toISOString(),
  total: products.length,
  valid: valid.length,
  missing: missing.length,
  invalid: invalid.length,
  passRate: `${passRate}%`,
  missingIds: missing.map(p => p.id),
  invalidIds: invalid.map(p => p.id),
};

fs.writeFileSync(
  path.resolve(__dirname, '../CATALOG_VALIDATION_REPORT.json'),
  JSON.stringify(report, null, 2),
  'utf8'
);

console.log('✅ Relatório salvo em: CATALOG_VALIDATION_REPORT.json\n');

process.exit(passRate === 100 ? 0 : 1);
