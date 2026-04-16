AUTOMAÇÃO DE BUSCA DE IMAGENS

Objetivo:
- buscar imagens automaticamente na internet por nome/descrição do item
- baixar, converter para webp e colocar em public/products/catalog/<id>.webp
- atualizar data/catalog-photo-manifest.json
- evitar busca manual item por item

Como funciona:
- usa SerpAPI com Google Images
- filtra alguns domínios ruins
- pega o primeiro resultado utilizável
- atualiza o manifesto

Honestidade do catálogo:
- o script mantém FILL_KIND=imagem-conceitual por padrão
- isso evita marcar referência web como foto real do seu produto físico

Como rodar:
1. extraia por cima do projeto
2. rode:
   powershell -ExecutionPolicy Bypass -File .\APLICAR-AUTOMACAO-IMAGENS.ps1
3. copie .env.images.example para .env.local ou defina as variáveis no PowerShell
4. rode:
   npm install
   npm run catalog:fill-images

Exemplos no PowerShell:
$env:SERPAPI_KEY="SUA_CHAVE"
$env:FILL_MODE="conceptual-only"
$env:FILL_SKIP_IDS="mdh-001,mdh-002"
$env:FILL_MAX_ITEMS="80"
npm run catalog:fill-images

Custo:
- SerpAPI normalmente cobra por volume
- em troca você automatiza centenas de buscas

Limitação:
- resultado de Google Images pode vir errado em alguns itens
- por isso o ideal é rodar em lotes, por exemplo 20 ou 50 por vez, revisar e rodar de novo
