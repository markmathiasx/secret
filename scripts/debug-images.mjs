import fs from "fs";
const catalog = fs.readFileSync("lib/catalog.ts", "utf-8");
const idx = catalog.indexOf('id: "mdh-001"');
console.log("Found at:", idx);
const block = catalog.slice(idx, idx + 500);
const m = block.match(/images:\s*\[([^\]]*)\]/);
console.log("Images match:", m ? m[0] : "NOT FOUND");
console.log("---");
// Check if the replacement logic works
const manifest = JSON.parse(fs.readFileSync("data/catalog-photo-manifest.json", "utf-8"));
const entry = manifest.find(e => e.id === "mdh-001");
console.log("Gallery:", entry.gallery);
const newImages = `images: [${entry.gallery.map(g => `"${g}"`).join(", ")}]`;
console.log("New:", newImages);
console.log("Current:", m ? m[0] : "none");
console.log("Are they equal?", m && m[0] === newImages);
