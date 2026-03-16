import { randomBytes, scryptSync } from 'node:crypto';

const password = process.argv.slice(2).join(' ').trim();
if (!password) {
  console.error('Uso: npm run admin:hash -- "SUA_SENHA_FORTE"');
  process.exit(1);
}

const salt = randomBytes(16).toString('hex');
const digest = scryptSync(password, salt, 64).toString('hex');
console.log(`s2:${salt}:${digest}`);
