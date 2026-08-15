import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

function parseNumberFlag(name, fallback = Number.POSITIVE_INFINITY) {
  const prefix = `${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix));
  if (!raw) return fallback;
  const value = Number(raw.slice(prefix.length));
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Valor inválido para ${name}: ${raw.slice(prefix.length)}`);
  }
  return value;
}

function resolveNpmCli() {
  const candidates = [
    process.env.npm_execpath,
    process.env.NPM_CLI_JS,
    join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const absolute = resolve(candidate);
    if (existsSync(absolute)) return absolute;
  }
  return null;
}

function runNpmAudit(args) {
  const common = {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
    env: process.env,
  };

  const npmCommand = process.env.NPM_COMMAND || (process.platform === 'win32' ? 'npm.cmd' : 'npm');
  const direct = spawnSync(npmCommand, args, common);
  if (!direct.error) return direct;

  const npmCli = resolveNpmCli();
  if (npmCli) {
    const cli = spawnSync(process.execPath, [npmCli, ...args], common);
    if (!cli.error) return cli;
  }

  if (process.platform === 'win32') {
    const comspec = process.env.ComSpec || process.env.COMSPEC || 'cmd.exe';
    return spawnSync(comspec, ['/d', '/s', '/c', 'npm', ...args], common);
  }

  return direct;
}

const omitDev = process.argv.includes('--omit-dev');
const inputArg = process.argv.find((arg) => arg.startsWith('--input='));
const reportArg = process.argv.find((arg) => arg.startsWith('--report='));
const inputPath = inputArg ? resolve(inputArg.slice('--input='.length)) : null;
const reportPath = resolve(reportArg ? reportArg.slice('--report='.length) : 'output/npm-audit.json');
const limits = {
  total: parseNumberFlag('--max-total'),
  critical: parseNumberFlag('--max-critical'),
  high: parseNumberFlag('--max-high'),
  moderate: parseNumberFlag('--max-moderate'),
  low: parseNumberFlag('--max-low'),
  info: parseNumberFlag('--max-info'),
};

const args = ['audit', '--json'];
if (omitDev) args.push('--omit=dev');

let report;
try {
  const rawReport = inputPath ? readFileSync(inputPath, 'utf8') : (() => {
    const result = runNpmAudit(args);
    if (result.error) throw result.error;
    if (!result.stdout?.trim()) {
      throw new Error(`npm audit não retornou JSON. ${result.stderr || ''}`.trim());
    }
    return result.stdout;
  })();
  report = JSON.parse(rawReport);
} catch (error) {
  throw new Error(`Não foi possível interpretar o JSON do npm audit: ${error.message}`);
}

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (report?.error) {
  throw new Error(`npm audit falhou: ${report.error.summary || report.error.message || JSON.stringify(report.error)}`);
}
if (!report?.metadata?.vulnerabilities) {
  throw new Error('npm audit retornou um relatório sem metadata.vulnerabilities.');
}

const vulnerabilities = report.metadata.vulnerabilities;
const counts = {
  info: Number(vulnerabilities.info || 0),
  low: Number(vulnerabilities.low || 0),
  moderate: Number(vulnerabilities.moderate || 0),
  high: Number(vulnerabilities.high || 0),
  critical: Number(vulnerabilities.critical || 0),
  total: 0,
};
counts.total = Number.isFinite(Number(vulnerabilities.total))
  ? Number(vulnerabilities.total)
  : counts.info + counts.low + counts.moderate + counts.high + counts.critical;

console.log(JSON.stringify({ omitDev, counts, report: reportPath }, null, 2));

const failures = Object.entries(limits)
  .filter(([, limit]) => Number.isFinite(limit))
  .filter(([severity, limit]) => counts[severity] > limit)
  .map(([severity, limit]) => `${severity}: ${counts[severity]} > ${limit}`);

if (failures.length) {
  console.error(`AUDITORIA NPM REPROVADA: ${failures.join('; ')}`);
  process.exit(1);
}

console.log('AUDITORIA NPM: OK');
