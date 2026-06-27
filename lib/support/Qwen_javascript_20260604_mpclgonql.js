import fs from 'fs';
import path from 'path';

const productsFile = path.join(process.cwd(), 'data', 'products.json');

if (!fs.existsSync(productsFile)) {
  console.error('❌ products.json not found');
  process.exit(1);
}

const raw = fs.readFileSync(productsFile, 'utf8');
const data = JSON.parse(raw);
const arr = Array.isArray(data) ? data : (data.products || []);

let errors = 0;
let valid = 0;
const samples = [];

arr.forEach((item, i) => {
  if (item.pricePix !== undefined && item.priceCard !== undefined) {
    const pix = parseFloat(item.pricePix);
    const card = parseFloat(item.priceCard);
    const expected = parseFloat((pix - 1.00).toFixed(2));
    
    if (Math.abs(expected - card) > 0.01) {
      console.error(`❌ ${item.id || i}: Pix=${pix} Card=${card} (expected ${expected})`);
      errors++;
    } else {
      valid++;
      if (samples.length < 10) {
        samples.push({
          id: item.id || i,
          name: item.name || 'Produto',
          pix: pix,
          card: card
        });
      }
    }
  }
});

console.log('\n=== VALIDATION REPORT ===');
console.log(`Total products: ${arr.length}`);
console.log(`Valid: ${valid}`);
console.log(`Errors: ${errors}`);
console.log('\nSamples:');
console.log(JSON.stringify(samples, null, 2));

if (errors > 0) {
  console.error('\n❌ VALIDATION FAILED');
  process.exit(1);
} else {
  console.log('\n✅ VALIDATION PASSED');
  process.exit(0);
}