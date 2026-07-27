import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, 'output');
fs.mkdirSync(outDir, { recursive: true });

function readJson(relative, fallback = {}) {
  try { return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8')); } catch { return fallback; }
}
function git(args) {
  try { return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; }
}

const verification = readJson('output/industrial-v6-verification.json');
const auditProduction = readJson('output/npm-audit-production.json');
const catalogAudit = readJson('output/catalog-commercial-audit.json');
const changed = git(['status', '--short']).split(/\r?\n/).filter(Boolean);
const diffStat = git(['diff', '--stat']);

const report = {
  generatedAt: new Date().toISOString(),
  branch: git(['branch', '--show-current']),
  commitBase: git(['rev-parse', 'HEAD']),
  verification,
  productionVulnerabilities: auditProduction?.metadata?.vulnerabilities || auditProduction?.counts || null,
  catalog: {
    totalProducts: catalogAudit.totalProducts ?? null,
    productsWithIssues: catalogAudit.productsWithIssues ?? null,
    issueCounts: catalogAudit.issueCounts ?? null,
  },
  changedFiles: changed,
  diffStat,
};

fs.writeFileSync(path.join(outDir, 'INDUSTRIAL-V6-REPORT.json'), JSON.stringify(report, null, 2));
const md = `# Relatório Industrial V6\n\n- Gerado em: ${report.generatedAt}\n- Branch: ${report.branch || 'não identificada'}\n- Base: ${report.commitBase || 'não identificada'}\n- Nota do verificador: ${verification.score ?? 'n/d'}/10\n- Falhas do verificador: ${(verification.failures || []).length}\n- Avisos do verificador: ${(verification.warnings || []).length}\n\n## Diff\n\n\`\`\`text\n${diffStat || 'Sem estatística disponível'}\n\`\`\`\n\n## Observação\n\nEste relatório registra somente resultados produzidos pelos validadores locais. A aprovação de produção depende também do stage Vercel, smoke tests e promoção concluídos pelo aplicador PowerShell.\n`;
fs.writeFileSync(path.join(outDir, 'INDUSTRIAL-V6-REPORT.md'), md);
console.log(md);
