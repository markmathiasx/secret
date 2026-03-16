# MDH 3D Store — site estático premium

Este pacote funciona abrindo `index.html` direto no navegador, sem servidor.

## Estrutura
- `index.html` — home premium com vídeo, tabs e destaques
- `catalogo.html` — catálogo filtrável em JS puro
- `imagem-para-impressao-3d.html` — upload local + WhatsApp/e-mail
- `faq.html` — perguntas frequentes
- `assets/images/` — imagens de produtos, impressoras, filamentos, peças e logo
- `assets/videos/hero-bg.mp4` — vídeo de fundo do hero
- `assets/js/config.js` — dados da empresa
- `assets/js/products.js` — base de produtos + expansão demo para 600 itens
- `data/products.json` — 60 produtos base para editar manualmente

## Como testar localmente
1. Extraia o ZIP.
2. Dê duplo clique em `index.html`.
3. Navegue entre as páginas pelo menu.

## Personalização rápida
### WhatsApp, Instagram e e-mail
Edite `assets/js/config.js`.

### Vídeo de fundo
Substitua `assets/videos/hero-bg.mp4` mantendo o mesmo nome.

### Produtos
- edite `data/products.json` para manter um catálogo base organizado;
- depois replique as mudanças também em `assets/js/products.js`, na constante `window.MDH_PRODUCTS_BASE`.

### Troca de imagens
- produtos: `assets/images/products/product-01.jpg` até `product-30.jpg`
- impressoras: `assets/images/printers/`
- filamentos: `assets/images/filaments/`
- peças prontas: `assets/images/finished/`

## Deploy na Vercel
### Pelo painel
1. Crie um novo projeto.
2. Faça upload da pasta ou conecte a um repositório.
3. Escolha **Other** como preset.
4. Deixe o build command vazio.
5. Publique.

### Pela CLI
```bash
npm i -g vercel
vercel
vercel --prod
```

## Observação importante sobre upload de arquivos
Como o site é totalmente estático e roda até em `file://`, o navegador não consegue anexar automaticamente o arquivo local ao WhatsApp ou ao e-mail. O fluxo criado aqui:
- valida tipo e tamanho do arquivo;
- mostra nome/tamanho do arquivo;
- monta a mensagem pronta;
- você anexa o arquivo manualmente no WhatsApp ou no e-mail depois.
