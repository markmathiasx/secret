import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const packagePath = path.join(root, "package.json");

function withoutBom(text) {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

const raw = withoutBom(await fs.readFile(packagePath, "utf8"));
const pkg = JSON.parse(raw);

pkg.dependencies = pkg.dependencies || {};
pkg.devDependencies = pkg.devDependencies || {};
pkg.scripts = pkg.scripts || {};

delete pkg.dependencies["prisma"];
delete pkg.devDependencies["@prisma/client"];

pkg.dependencies["@prisma/client"] = "6.16.3";
pkg.devDependencies["prisma"] = "6.16.3";

pkg.dependencies["next-auth"] = pkg.dependencies["next-auth"] || "^4.24.14";
pkg.dependencies["@auth/prisma-adapter"] = pkg.dependencies["@auth/prisma-adapter"] || "^2.11.2";
pkg.dependencies["bcryptjs"] = pkg.dependencies["bcryptjs"] || "^3.0.3";
pkg.dependencies["otplib"] = pkg.dependencies["otplib"] || "^13.4.0";
pkg.dependencies["nodemailer"] = pkg.dependencies["nodemailer"] || "^7.0.13";

if (!pkg.scripts["db:generate"]) {
  pkg.scripts["db:generate"] = "npx prisma generate";
}
if (!pkg.scripts["validate:storefront"]) {
  pkg.scripts["validate:storefront"] = "npm run db:generate && npm run build";
}

await fs.writeFile(packagePath, JSON.stringify(pkg, null, 2) + "\n", "utf8");

console.log(JSON.stringify({
  ok: true,
  package: "package.json",
  prismaClient: pkg.dependencies["@prisma/client"],
  prismaCli: pkg.devDependencies["prisma"],
  note: "package.json ajustado para Prisma 6 compatível com o schema atual"
}, null, 2));
