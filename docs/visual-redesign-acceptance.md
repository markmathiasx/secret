# MDH 3D Store Visual Redesign Acceptance

## Before / After Esperado

- Antes: storefront escura com ajustes incrementais, cards muito parecidos e catálogo com leitura de grade comum.
- Depois: laboratório premium de fabricação digital, primeiro viewport cinematográfico, navegação comercial clara e catálogo editorial com filtros por intenção.

## Seções Alteradas

- Home: hero cinematográfico, trust strip, bento comercial, showcase editorial, produção, sob medida, uploader e CTA final.
- Catálogo: hero com vídeo local, busca grande, chips comerciais, compra por intenção, explorer, blocos editoriais e ProductCard Ultra.
- PDP: galeria destacada, buybox sticky, preço Pix dominante, mídia honesta, produção, FAQ e relacionados preservados.
- Layout global: header, footer, tokens visuais, grid CAD, painéis instrumentados e microinterações.

## Componentes Alterados

- `PremiumHero`
- `CatalogBuyingIntents`
- `CatalogExplorer`
- `PremiumCard`
- `SiteHeader`
- `ProductPage`
- CSS global de visual system

## Checklist Visual

- [x] Hero mostra headline grande e CTA claro em menos de 3 segundos.
- [x] Visual usa grafite, metal escuro, ciano, violeta, verde-lima e âmbar controlado.
- [x] Grid CAD e linhas técnicas aparecem como textura, não como ruído.
- [x] Cards têm bordas luminosas, profundidade e hover perceptível.
- [x] Seções têm ritmo variado, sem repetição de grade simples.

## Checklist Catálogo

- [x] Busca grande no topo.
- [x] Filtros por intenção existem e aplicam rotas reais.
- [x] Cards exibem imagem grande, preço Pix, material, acabamento, prazo, compra e WhatsApp.
- [x] Blocos editoriais quebram a repetição entre produtos.
- [x] Estado vazio mantém CTA para limpar filtros ou pedir sob medida.

## Checklist Mobile

- [x] Header mobile preserva busca, menu, conta e carrinho.
- [x] CTAs empilham sem texto sobrepor.
- [x] Cards usam dimensões estáveis e grid responsivo.
- [x] Inputs têm 16px ou mais para evitar zoom involuntário no iOS.

## Checklist Performance

- [x] Vídeos são locais.
- [x] `preload="metadata"` no `SafeBackgroundVideo`.
- [x] Vídeos não carregam em todos os cards.
- [x] Posters WebP são usados.
- [x] Animações usam transform/opacity.
- [x] `prefers-reduced-motion` reduz animações e vídeo decorativo.

## Checklist Mídia

- [x] Assets registrados em `public/media/licenses/video-assets.json`.
- [x] Fontes são Pexels API com Pexels License.
- [x] `sourceUrl`, creator, license e uso comercial registrados.
- [x] Sem uso de YouTube, TikTok, Instagram ou mídia remota direta no frontend.
- [x] Sem marca/logotipo visível identificado nos posters revisados.

## Limitações Reais

- `ffmpeg` não estava disponível no PATH local; os MP4s leves do Pexels foram mantidos e a limitação fica registrada em `video-assets-limitations.json`.
- A revisão de marca/watermark foi feita por posters e metadados, não por auditoria frame a frame com ferramenta de visão dedicada.
