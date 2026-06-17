# Como editar produtos da loja inteligente

A loja inteligente usa `data/produtos.csv`.

## Campos principais

- `Identificador URL`: slug publico usado em `/produto/[slug]`.
- `Nome`: nome do produto.
- `Categorias`: categoria exibida e filtrada na loja.
- `Preço`: preco de cartao. Pela regra atual, deve ser Pix + R$ 1.
- `Preço promocional`: preco Pix calculado como custo de producao + 30% de lucro.
- `Custo de produção`: custo base estimado da peca. Se existir, o site recalcula Pix e cartao a partir dele.
- `Custo do filamento/kg`: referencia de custo do rolo em reais por kg. O fallback atual e `100`.
- `Lucro (%)`: markup aplicado ao custo. A regra atual e `30`.
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

## Regra de preco atual

O preco da loja inteligente segue:

```text
Pix = Custo de producao x 1,30
Cartao = Pix + R$ 1,00
```

Quando `Custo de produção` estiver vazio, o normalizador usa o preco promocional anterior como custo quando ele for menor que o preco cheio; caso contrario usa `Preço` como custo base. Para produtos novos, preencha `Custo de produção` diretamente.

## Produto sem Nuvemshop

Deixe `Link Nuvemshop` vazio. O botao principal vira `Pedir orçamento no WhatsApp` com mensagem automatica.

## Produto com Nuvemshop

Use URL absoluta ou caminho relativo:

```csv
"https://mdh3d.lojavirtualnuvem.com.br/produtos/chaveiro-flamengo-3d"
"/produtos/vaso-geometrico-pla"
```

Para caminho relativo funcionar, configure `VITE_NUVEMSHOP_BASE_URL`, `NEXT_PUBLIC_NUVEMSHOP_BASE_URL` ou `NUVEMSHOP_BASE_URL`.

## Expansão Copa/temas

Os 300 itens novos ficam em `data/copa-theme-expansion-300.json` e aparecem tanto no catálogo quanto em `/loja`.

- Edite `pricePix`, `priceCard`, `costBreakdown.totalCost` e `profitMarkupPercent` juntos se mudar a regra.
- As imagens ficam em `/products/copa-theme-expansion/`.
- Para usar STLFlix, importe somente modelos com assinatura/licença válida e guarde a prova de licença fora do Git.

## Validacao

Depois de editar:

```bash
npm run validate:mdh-smart-store
npm run test:mdh-smart-store
npm run build
```
