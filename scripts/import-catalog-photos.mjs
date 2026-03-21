import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import manifest from "../data/catalog-photo-manifest.json" with { type: "json" };

const root = process.cwd();
const sourceDir = path.join(root, "output", "geek");
const outputDir = path.join(root, "public", "products", "catalog");

await fs.mkdir(outputDir, { recursive: true });

const results = [];

for (const entry of manifest) {
  const inputPath = path.join(sourceDir, entry.sourceFilename);
  const outputPath = path.join(outputDir, `${entry.id}.webp`);

  try {
    await fs.access(inputPath);
  } catch {
    throw new Error(`Arquivo de origem não encontrado para ${entry.id}: ${inputPath}`);
  }

  const image = sharp(inputPath, { failOn: "none" }).rotate();
  const metadata = await image.metadata();

  await image
    .resize({
      width: metadata.width && metadata.width > 1600 ? 1600 : undefined,
      height: metadata.height && metadata.height > 1600 ? 1600 : undefined,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 84, effort: 5 })
    .toFile(outputPath);

  results.push({
    id: entry.id,
    name: entry.name,
    kind: entry.kind,
    source: inputPath,
    output: outputPath,
  });
}

console.log(JSON.stringify({ imported: results.length, outputDir, results }, null, 2));
