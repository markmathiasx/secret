import fs from "fs";
const c = fs.readFileSync("lib/catalog.ts", "utf-8");

// Count all images arrays for mdh products
const allMatches = [...c.matchAll(/id:\s*"(mdh-\d+)"/g)];
let ok = 0, bad = 0;
for (const match of allMatches) {
  const id = match[1];
  const idx = match.index;
  const block = c.slice(idx, idx + 800);
  // Multi-line images array
  const m = block.match(/images:\s*\[([^\]]*)\]/);
  if (m) {
    const imgs = m[1].split(",").map(s => s.trim()).filter(Boolean);
    if (imgs.length >= 3) { ok++; }
    else { console.log(id, ":", imgs.length, "images (NEEDS MORE)"); bad++; }
  } else {
    console.log(id, ": no images[] found"); bad++;
  }
}
console.log(`\nTotal: ${allMatches.length}, OK (3+): ${ok}, Need fix: ${bad}`);
