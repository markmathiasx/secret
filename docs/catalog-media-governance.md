# Governança de Mídia do Catálogo — MDH 3D Store

## Regra de Ouro

> Nenhuma imagem é exibida como "foto do produto" a menos que tenha passado por verificação semântica ou manual.

## Status de Verificação de Mídia

| Status | Uso público | Hero elegível | SEO/OG | Descrição |
|--------|------------|---------------|--------|-----------|
| `verified` | ✅ Sim | ✅ Sim | ✅ Sim | Foto real do produto já produzido |
| `render-verified` | ✅ Sim | ✅ Sim | ✅ Sim | Render gerado do modelo 3D real (STL/3MF) |
| `probable` | ✅ Com nota | ⚠️ Com disclaimer | ✅ Sim | Alta correspondência semântica nome/imagem |
| `needs_review` | ⚠️ Limitado | ❌ Não | ❌ Não | Correspondência incerta, aguardando revisão |
| `placeholder` | ⚠️ Com overlay | ❌ Não | ❌ Não | Imagem genérica/IA que não representa o produto |
| `rejected` | ❌ Nunca | ❌ Nunca | ❌ Nunca | Imagem incorreta, não deve ser exibida |

## Tratamento Visual por Status

### Produtos Verificados (foto-real / render-fiel)
- Borda esmeralda sutil no card
- Badge "Foto real" ou "Render fiel" em verde
- Imagem elegível para hero, OG tags e JSON-LD
- Sem overlays ou disclaimers

### Produtos Prováveis
- Borda padrão no card
- Badge "Imagem provável" em ciano
- Nota discreta: "imagem ilustrativa" quando necessário
- Incluído em SEO structured data

### Produtos em Revisão / Placeholder
- Borda âmbar no card
- Badge "Em revisão" ou "Ilustrativa" em âmbar
- Overlay obrigatório: "Imagem ilustrativa — não representa o produto final"
- **Excluído de JSON-LD, OG tags e Twitter cards**
- OG fallback: logo da marca

## Pipeline de Verificação

```
1. Produto entra no catálogo
2. `validateProductMedia(product)` deriva status automaticamente
3. Se foto-real → verified (auto)
4. Se render-fiel → render-verified (auto)
5. Se imagem-conceitual + score >= 60% → probable (auto)
6. Se imagem-conceitual + score 30-59% → needs_review (manual)
7. Se imagem-conceitual + score < 30% → placeholder (auto)
8. Override manual via PRODUCT_VISUAL_OVERRIDES em product-visuals.ts
```

## Processo de Revisão Manual

1. Executar `auditCatalogMedia(products)` para gerar relatório
2. Revisar itens com status `needs_review`
3. Para cada item:
   - Se imagem corresponde ao produto → adicionar override para "probable" ou "verified"
   - Se imagem NÃO corresponde → adicionar override para "placeholder" ou "rejected"
4. Atualizar `PRODUCT_VISUAL_OVERRIDES` em `lib/product-visuals.ts`

## Correspondência Semântica

O sistema calcula um score de 0-100% comparando:
- Nome do produto (40% do peso)
- Categoria (20%)
- Tags (20%)
- Descrição (20%)
- Bônus: ID do produto no nome do arquivo

## Arquivos Relevantes

| Arquivo | Função |
|---------|--------|
| `lib/media-validation.ts` | Core do sistema de validação |
| `lib/product-visuals.ts` | Overrides manuais e inferência visual |
| `lib/catalog-photo-manifest.ts` | Manifesto do catálogo fotográfico |
| `data/catalog-photo-manifest.json` | Dados de 748 produtos |
| `components/product-image-gallery.tsx` | Galeria com overlays honestos |
| `components/product-visual-authenticity.tsx` | Badges e notices |
| `app/catalogo/[slug]/page.tsx` | PDP com SEO conditional |

## Caso Crítico Documentado: mdh-057

**Produto**: Organizador de Maquiagem
**Problema**: Imagem era blob abstrato gerado por IA (esferas e formas geométricas) que NÃO representava um organizador de maquiagem
**Solução**: Override manual em `PRODUCT_VISUAL_OVERRIDES` com status "imagem-conceitual" + nota de alerta
**Ação pendente**: Fotografar o produto real ou gerar render a partir do arquivo 3D

## Princípios

1. **Transparência > Estética**: Melhor mostrar overlay "imagem ilustrativa" do que enganar o cliente
2. **Automatização primeiro**: O sistema deriva status automaticamente; overrides são exceção
3. **SEO limpo**: Google Merchant Center e Rich Snippets nunca recebem imagens não verificadas
4. **Progressão natural**: O objetivo é migrar todos os 214 produtos conceituais para foto-real ou render-fiel
