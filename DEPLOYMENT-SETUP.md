# 🚀 MDH 3D Store - Deployment Setup (Node 24.x)

## ✅ Configuração Otimizada para Vercel

Este documento descreve a configuração 100% otimizada do projeto para deploy em produção.

### 📋 Checklist de Deploy

- ✅ **Node.js**: Pinado em `24.x` via `package.json`, `.nvmrc` e `.node-version`
- ✅ **Next.js Output**: Configurado em `standalone` para máxima performance
- ✅ **vercel.json**: Validado e otimizado sem propriedades conflitantes
- ✅ **Variables de Ambiente**: Todas as variáveis públicas em `.env.example`
- ✅ **Build Command**: `npm run build` (sem erros de cache)
- ✅ **Install Command**: `npm ci` (instalação limpa e determinística)
- ✅ **Output Directory**: `.next` (configurado corretamente)

### 🔧 Configurações Críticas

#### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "cleanUrls": true,
  "trailingSlash": false
}
```

**Pontos Importantes:**
- `outputDirectory`: `.next` (não `.next/standalone`)
- `installCommand`: `npm ci` (mais confiável que `npm install`)
- Sem propriedade `nodeVersion` (controla via `package.json` engines)

#### `package.json` - Engines
```json
"engines": {
  "node": "24.x",
  "npm": ">=10.0.0"
}
```

#### `next.config.ts` - Output
```typescript
output: 'standalone'
```

### 📁 Arquivos de Versionamento Node

- `.nvmrc` → Usado por nvm, fnm
- `.node-version` → Usado por volta, asdf
- `package.json` engines → Usado por Vercel

### 🛑 Evitar em Deploy

❌ Não coloque `nodeVersion` no `vercel.json`  
❌ Não use `npm install` (use `npm ci`)  
❌ Não mude `outputDirectory` para `.next/standalone`  
❌ Não deixe arquivos de configuração no `.next/standalone/`  

### 📊 Validação Pré-Deploy

Execute antes de fazer push:

```bash
# 1. Validar build local
npm run build

# 2. Testar start
npm start

# 3. Verificar JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('vercel.json')))"

# 4. Ver Node version
node --version
```

### 🔄 Processo de Deploy

```bash
# 1. Atualizar código
git add .
git commit -m "feat: descrição da mudança"

# 2. Push para main
git push origin main

# 3. Vercel faz deploy automaticamente
# ou manualmente:
vercel deploy --prod
```

### 📝 Variáveis de Ambiente

Configurar no Dashboard do Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Outras conforme `.env.example`

### 🐛 Troubleshooting

**Erro: "routes-manifest.json não encontrado"**
- ✓ Verifique `outputDirectory` no `vercel.json` = `.next`
- ✓ Certifique-se que `next.config.ts` tem `output: 'standalone'`

**Erro: "nodeVersion não suportado"**
- ✓ Remova completamente `nodeVersion` do `vercel.json`
- ✓ Use apenas `package.json` engines

**Build falha**
- ✓ Rode `npm run build` localmente
- ✓ Verifique `npm ci` funciona
- ✓ Confirme Node 24.x instalado localmente

### ✨ Resumo Final

- **Node**: 24.x ✓
- **Build**: Otimizado ✓
- **Deploy**: Automático via Git ✓
- **Status**: 100% produção-ready ✓

---

**Última atualização**: 17/03/2026  
**Status**: ✅ Pronto para produção
