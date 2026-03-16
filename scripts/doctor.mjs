import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const envPath = path.join(cwd, '.env.local');
const packageJson = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));

const required = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_WHATSAPP_NUMBER',
  'STAFF_NOTIFY_EMAIL'
];

const optional = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'MERCADOPAGO_ACCESS_TOKEN'
];

const env = fs.existsSync(envPath)
  ? Object.fromEntries(
      fs
        .readFileSync(envPath, 'utf8')
        .split(/\r?\n/)
        .filter((line) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line))
        .map((line) => {
          const idx = line.indexOf('=');
          return [line.slice(0, idx), line.slice(idx + 1)];
        })
    )
  : {};

console.log('MDH 3D doctor');
console.log('----------------');
console.log('Scripts disponíveis:', Object.keys(packageJson.scripts || {}).join(', '));
console.log('');

for (const key of required) {
  console.log(`${key}: ${env[key] ? 'OK' : 'MISSING'}`);
}
console.log('');
for (const key of optional) {
  console.log(`${key}: ${env[key] ? 'OK' : 'not configured'}`);
}

const suspectFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile()) {
      const content = fs.readFileSync(full, 'utf8');
      if (/^<<<<<<<|^>>>>>>>|^=======$/m.test(content)) suspectFiles.push(path.relative(cwd, full));
    }
  }
}
walk(path.join(cwd, 'src'));
if (fs.existsSync(path.join(cwd, '.env.example'))) {
  const envExample = fs.readFileSync(path.join(cwd, '.env.example'), 'utf8');
  if (/^<<<<<<<|^>>>>>>>|^=======$/m.test(envExample)) suspectFiles.push('.env.example');
}

console.log('');
console.log('Conflitos de merge remanescentes:', suspectFiles.length ? suspectFiles.join(', ') : 'nenhum');
