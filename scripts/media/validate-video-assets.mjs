import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");
const publicDir = path.join(rootDir, "public");
const manifestPath = path.join(publicDir, "media/licenses/video-assets.json");
const bannedSources = [/youtube\.com/i, /youtu\.be/i, /tiktok\.com/i, /instagram\.com/i];
const codeRoots = ["app", "components", "lib"].map((item) => path.join(rootDir, item));

const errors = [];

if (!fs.existsSync(manifestPath)) {
  errors.push("Missing public/media/licenses/video-assets.json");
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (!Array.isArray(manifest)) {
    errors.push("video-assets.json must be an array.");
  } else {
    for (const entry of manifest) validateManifestEntry(entry);
  }
}

for (const file of listCodeFiles(codeRoots)) {
  const text = fs.readFileSync(file, "utf8");
  const localVideoRefs = relative(file) === "lib/video-assets.ts"
    ? []
    : [...text.matchAll(/["'`]((?:\/media\/videos\/)[^"'`]+\.mp4)["'`]/g)].map((match) => match[1]);
  const remoteVideoRefs = [...text.matchAll(/https?:\/\/[^"'`\s]+\.(?:mp4|webm|mov)(?:\?[^"'`\s]+)?/gi)].map((match) => match[0]);

  for (const ref of localVideoRefs) {
    const diskPath = path.join(publicDir, ref.replace(/^\//, ""));
    if (!fs.existsSync(diskPath)) errors.push(`${relative(file)} references missing local video asset ${ref}`);
  }

  for (const ref of remoteVideoRefs) {
    errors.push(`${relative(file)} uses remote video directly: ${ref}`);
  }
}

if (errors.length) {
  console.error("[media:validate] failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("[media:validate] ok");

function validateManifestEntry(entry) {
  const label = entry?.id ?? "(missing id)";
  for (const key of ["id", "source", "sourceUrl", "creator", "license", "licenseUrl", "downloadedAt"]) {
    if (!entry?.[key]) errors.push(`${label}: missing ${key}`);
  }

  if (entry?.commercialUseAllowed !== true) errors.push(`${label}: commercialUseAllowed must be true`);
  if (entry?.brandLogoVisible !== false) errors.push(`${label}: brandLogoVisible must be false`);

  for (const key of ["sourceUrl", "licenseUrl"]) {
    if (entry?.[key] && bannedSources.some((pattern) => pattern.test(entry[key]))) {
      errors.push(`${label}: banned source in ${key}`);
    }
  }

  for (const key of ["originalFile", "optimizedFile", "posterFile"]) {
    const value = entry?.[key];
    if (!value) continue;
    if (/^https?:\/\//i.test(value)) {
      errors.push(`${label}: ${key} must be local, not remote`);
      continue;
    }
    const diskPath = path.join(publicDir, value.replace(/^\//, ""));
    if (!fs.existsSync(diskPath)) errors.push(`${label}: missing ${key} ${value}`);
  }
}

function listCodeFiles(roots) {
  const files = [];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    walk(root, files);
  }
  return files.filter((file) => /\.(tsx?|jsx?)$/.test(file));
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
}

function relative(file) {
  return path.relative(rootDir, file).replaceAll("\\", "/");
}
