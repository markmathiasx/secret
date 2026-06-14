# Como editar produtos da loja inteligente

A loja inteligente usa `data/produtos.csv`.

## Campos principais

- `Identificador URL`: slug publico usado em `/produto/[slug]`.
- `Nome`: nome do produto.
- `Categorias`: categoria exibida e filtrada na loja.
- `Preço`: preco de cartao ou preco cheio.
- `Preço promocional`: preco Pix/promocional quando existir.
- `Estoque`: quantidade informativa.
- `SKU`: codigo do produto.
- `Descrição`: texto publico do produto.
- `Tags`: termos separados por virgula para busca e filtros.
- `Título para SEO` e `Descrição para SEO`: metadata da pagina.
- `Link Nuvemshop`: opcional. Se existir, o botao principal abre checkout externo.
- `Imagem`: caminho publico, exemplo `/catalog-assets/mdh-1.webp`.

## Campos opcionais aceitos

- `Material`
- `Cores`
- `Personalizável`
- `Prazo de produção`
- `Galeria`
- `Vídeo`

Se esses campos nao existirem, o normalizador aplica defaults seguros: PLA, cores comuns, prazo de 2 a 5 dias uteis e galeria com assets locais.

## Produto sem Nuvemshop

Deixe `Link Nuvemshop` vazio. O botao principal vira `Pedir orçamento no WhatsApp` com mensagem automatica.

## Produto com Nuvemshop

Use URL absoluta ou caminho relativo:

```csv
"https://mdh3d.lojavirtualnuvem.com.br/produtos/chaveiro-flamengo-3d"
"/produtos/vaso-geometrico-pla"
```

Para caminho relativo funcionar, configure `VITE_NUVEMSHOP_BASE_URL`, `NEXT_PUBLIC_NUVEMSHOP_BASE_URL` ou `NUVEMSHOP_BASE_URL`.

## Validacao

Depois de editar:

```bash
npm run validate:mdh-smart-store
npm run test:mdh-smart-store
npm run build
```
