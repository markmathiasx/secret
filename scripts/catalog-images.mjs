import fs from 'node:fs';
import path from 'node:path';

const placeholders = path.join(process.cwd(), 'public', 'placeholders');
fs.mkdirSync(placeholders, { recursive: true });
const file = path.join(placeholders, 'product-card.svg');
if (!fs.existsSync(file)) {
  fs.writeFileSync(
    file,
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" fill="none"><rect width="1200" height="1200" rx="64" fill="#09111F"/><rect x="56" y="56" width="1088" height="1088" rx="48" fill="url(#a)" opacity="0.9"/><path d="M220 840C310 640 420 520 600 520C780 520 890 640 980 840" stroke="#E2F4FF" stroke-opacity="0.35" stroke-width="34" stroke-linecap="round"/><circle cx="600" cy="400" r="150" fill="#101A2E" stroke="#7DD3FC" stroke-opacity="0.45" stroke-width="18"/><path d="M540 350H660M540 400H620M540 450H680" stroke="#E2F4FF" stroke-opacity="0.75" stroke-width="18" stroke-linecap="round"/><text x="600" y="930" fill="#E2F4FF" fill-opacity="0.82" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700" text-anchor="middle">MDH 3D</text><text x="600" y="980" fill="#E2F4FF" fill-opacity="0.52" font-family="Arial, Helvetica, sans-serif" font-size="24" text-anchor="middle">Placeholder premium para catálogo</text><defs><linearGradient id="a" x1="120" y1="80" x2="1050" y2="1120" gradientUnits="userSpaceOnUse"><stop stop-color="#0B1326"/><stop offset="0.5" stop-color="#0C162B"/><stop offset="1" stop-color="#07101F"/></linearGradient></defs></svg>`
  );
}
console.log(`Placeholder garantido em ${file}`);
