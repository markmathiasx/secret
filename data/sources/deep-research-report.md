# Curadoria de 160 produtos comerciais para e‑commerce brasileiro

## Resumo executivo

Foi gerado um catálogo curado com **160 produtos** (40 por categoria) voltados a compradores de e‑commerce no Brasil (pt‑BR), priorizando **IPs populares** (Valorant, League of Legends, Call of Duty, Marvel, Star Wars, anime e cultura nerd) e formatos com alta saída no varejo (presentes, itens de setup, decoração e utilidades). O catálogo foi estruturado com **títulos otimizados**, descrições curtas (2 linhas), **SKU sugerido**, preços (baixo/mediano/alto), tags, dimensões/peso de envio, notas de compatibilidade, cross‑sells e estratégia de margem (PIX + bundles).

Limitação importante: **URLs diretas de imagens e links de produto não puderam ser verificados em escala aqui**, então os campos de imagens e “source link” foram preenchidos como **“NÃO VERIFICADO”** para evitar inserção de links quebrados ou de uso indevido. Isso atende ao requisito de marcar o que não foi verificado, e acompanha um checklist enxuto para completar/verificar esses campos antes de publicar.

Você já tem:
- **4 tabelas** (40 itens cada, uma por categoria) prontas para revisar/editar.
- **1 CSV combinado** (160 itens) e **4 CSVs separados** (um por categoria) prontos para importação e enriquecimento.

[Baixar CSV combinado (160 itens)](sandbox:/mnt/data/catalogo_curado_160_itens_ptbr.csv)  
[Baixar CSV de Chaveiros (40)](sandbox:/mnt/data/catalogo_chaveiros_40_ptbr.csv)  
[Baixar CSV de Decoração (40)](sandbox:/mnt/data/catalogo_decoracao_40_ptbr.csv)  
[Baixar CSV de Utilitários/Ferramentas (40)](sandbox:/mnt/data/catalogo_utilitarios_40_ptbr.csv)  
[Baixar CSV de Colecionáveis/Merch (40)](sandbox:/mnt/data/catalogo_colecionaveis_40_ptbr.csv)

## Notas de licenciamento e uso de imagens

Quase todos os itens desta curadoria envolvem **marcas e personagens de terceiros** (jogos, filmes, anime). Isso pode exigir **licença** para fabricar/vender (ou pode restringir uso de nome/logotipo/arte), dependendo do produto, canal e forma de divulgação.

No Brasil, marcas e seus sinais distintivos são protegidos e o uso indevido pode gerar risco jurídico e remoções de listings. Uma referência pública e oficial sobre regras gerais de marcas no Brasil é o entity["organization","Instituto Nacional da Propriedade Industrial","brazil ip office"]. citeturn17search3turn17search11

Recomendação operacional (prática de e‑commerce):
- **Imagens**: mesmo quando existir foto em marketplace, trate como “imagem de referência” e **substitua por fotos próprias** (estúdio simples + fundo neutro) antes de anunciar oficialmente.  
- **Uso de IP**: prefira **produtos licenciados** (revenda) ou designs **originais** (sem logotipos/nomes/elementos protegidos).  
- **Campos de imagem/link do CSV**: mantenha “NÃO VERIFICADO” até cortar/validar links e confirmar direitos de uso.

## Estrutura de dados e importação em plataforma de e‑commerce

### Como ler o CSV e mapear campos

O CSV foi desenhado para ser um “PIM leve” (planilha‑base), com grupos de campos:

**Identificação**
- `sku`, `title_pt`, `category`, `subcategory`

**Conteúdo comercial**
- `description_pt_2lines`, `tags_pt`

**Preço e margem**
- `price_low_brl`, `price_median_brl`, `price_high_brl`, `margin_pct_suggested`, `pricing_strategy_notes`

**Mídia e origem**
- `photo_url_1..3`, `thumbnail_url`, `source_product_link`, `source_marketplace_hint`, `source_lang`

**Logística**
- `shipping_weight_g`, `shipping_length_cm`, `shipping_width_cm`, `shipping_height_cm`

**Qualidade e recomendação**
- `compatibility_notes`, `cross_sell_sku_1`, `cross_sell_sku_2`

### Checklist rápido de importação e publicação

1) **Ajustar categorias**: criar as 4 categorias e subcategorias no seu e‑commerce para manter navegação limpa.  
2) **Importar CSV**: importar primeiro o CSV por categoria (40) para validar mapeamento, depois o combinado (160).  
3) **Validar SKUs**: garantir unicidade e padrão (já vem pronto).  
4) **Completar mídia**:
   - trocar `photo_url_*` e `thumbnail_url` de “NÃO VERIFICADO” para URLs válidas **ou** subir mídia para a plataforma  
   - preferir fotos próprias (recomendado)  
5) **Criar regras de preço**:
   - `price_median_brl` como preço principal  
   - aplicar desconto de PIX conforme `pricing_strategy_notes`  
   - ativar bundles sugeridos (combo de 2/3 itens)  
6) **Configurar frete**:
   - usar dimensões/peso para cálculo e faixas de envio  
7) **Publicar em ondas**:
   - publicar primeiro 10 itens por categoria (40 total)  
   - medir conversão/CTR → ajustar títulos/preço/arte → publicar o restante

## Catálogo curado por categoria

As quatro tabelas (40 itens cada) já estão organizadas e prontas para revisão, com SKUs, títulos otimizados, descrições, preços sugeridos, tags e cross‑sells. As colunas de imagens e links de referência estão como **NÃO VERIFICADO** para preenchimento/validação posterior.

Você pode baixar e editar os CSVs acima, ou usar as tabelas exibidas na conversa para ajustes finos antes da importação.

## Exportações CSV e como completar “NÃO VERIFICADO”

### Padrão de preenchimento recomendado (para cada produto)

- `source_product_link`:  
  - cole o link de um produto equivalente em marketplace (BR preferencial) **apenas como referência**, ou um link de loja oficial/licenciada  
  - se for internacional, preencher `source_lang` (ex.: `en`)  

- `photo_url_1..3` e `thumbnail_url`:  
  - preferir **fotos próprias** hospedadas no CDN da sua plataforma (ou storage/CDN seu)  
  - se usar imagens públicas temporariamente, validar:
    1) URL direta (abre a imagem no navegador)  
    2) estabilidade do link (sem expiração por token)  
    3) permissão de uso (idealmente substitua depois)

### Sugestão de política interna

- **Regra**: nenhum produto vai para “publicado” com mídia “NÃO VERIFICADO”.  
- **Revisão**: 2 pessoas (conteúdo + comercial) aprovam título, tags, preço e cross‑sell.  
- **Medição**: após publicar o primeiro lote, ajustar:
  - `price_median_brl` e desconto PIX  
  - títulos (ordem de palavras: “chaveiro gamer + IP + personagem + material + benefício”)  
  - bundles (kit presente e kit setup)

