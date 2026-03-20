# Imagegen Commercial Asset Queue

Status em `2026-03-19`: prompts preparados e validados em `dry-run`. A geração real com a skill `imagegen` depende de `OPENAI_API_KEY` configurada localmente.

## Objetivo

Padronizar os próximos assets comerciais da MDH 3D para evitar imagem genérica, inventada ou desalinhada com a proposta de venda. A fila abaixo prioriza peças com leitura de produto, fundo limpo, luz editorial e sensação de loja profissional.

## Regras

- Sempre usar imagem com cara de produto físico impresso em 3D.
- Evitar cenários fantasiosos quando a peça for utilidade, setup ou item de lote.
- Reservar composições mais cenográficas para geek premium e presentes afetivos.
- Quando existir foto real, usar como referência visual. Não trocar a peça por um objeto diferente só porque o título parece parecido.
- Se a imagem for conceito, manter a UI marcando isso com transparência.

## Fila inicial

### 1. Hero de presentes

```text
Use case: product-mockup
Asset type: landing page hero for 3D printed gifts
Primary request: create a premium editorial product photo of a small group of 3D printed personalized gift items for a Brazilian storefront
Scene/background: warm indoor studio, subtle wood and neutral decor, premium home setting
Subject: one family mini figure, one personalized keychain, one decorative nameplate, all clearly 3D printed and physically plausible
Style/medium: photorealistic-natural
Composition/framing: vertical composition, hero crop, negative space on upper right for headline
Lighting/mood: soft editorial light, premium ecommerce look
Color palette: warm beige, wood, muted cyan accents
Materials/textures: visible PLA layer lines, painted details only where plausible
Constraints: products must look like real 3D printed objects sold by a serious store; no brand logos; no watermark
Avoid: toy-store vibe, fake CGI shine, neon oversaturation, impossible geometry
```

### 2. Hero de setup

```text
Use case: product-mockup
Asset type: landing page hero for setup and organization products
Primary request: create an editorial product shot of 3D printed desk accessories and organizers
Scene/background: clean desk setup with monitor blur, headphone, keyboard, subtle cable management
Subject: headphone stand, controller stand, cable organizer and phone stand, all visibly 3D printed and functional
Style/medium: photorealistic-natural
Composition/framing: vertical composition, grouped products center-left, space for headline on right
Lighting/mood: clean studio lighting with subtle office realism
Color palette: graphite, white, muted cyan, neutral grays
Materials/textures: matte PLA, PETG where functional, realistic layer lines
Constraints: object ergonomics must feel believable for real use; no floating objects; no watermark
Avoid: sci-fi fantasy props, fake chrome, gimmicky gamer neon, clutter
```

### 3. Hero de brindes

```text
Use case: product-mockup
Asset type: landing page hero for custom 3D printed giveaways
Primary request: create a clean commercial scene with 3D printed keychains, badges and branded giveaway pieces ready for event or corporate order
Scene/background: premium tabletop with organized rows and a subtle packaging context
Subject: colorful 3D printed keychains, badge medallions and small branded giveaway pieces with ring hardware
Style/medium: photorealistic-natural
Composition/framing: vertical crop, repeated pieces suggesting batch production, clean focal hierarchy
Lighting/mood: polished ecommerce lighting, credible and commercial
Color palette: neutral tabletop with selective strong colors on the products
Materials/textures: clear 3D print texture, layered filament colors, metal rings
Constraints: products must feel manufacturable in batch; no fake brands; no watermark
Avoid: luxury jewelry styling, fantasy symbols unrelated to real giveaways, excessive props
```

### 4. Hero geek premium

```text
Use case: product-mockup
Asset type: landing page hero for geek collectibles
Primary request: create a premium editorial photo of a 3D printed collectible display with strong fan appeal
Scene/background: dark premium shelf environment with subtle bokeh and collector atmosphere
Subject: one painted creature miniature and one kawaii or pop-culture-inspired collectible, both clearly 3D printed
Style/medium: photorealistic-natural
Composition/framing: vertical crop, hero object centered, secondary object offset, room for title
Lighting/mood: dramatic but tasteful lighting, premium collector display
Color palette: dark charcoal, muted wood, controlled accent colors on the model paint
Materials/textures: visible 3D print texture, hand-painted details where appropriate
Constraints: must look like physical collectibles that could exist in the catalog; no watermark
Avoid: AI mush, overdone fantasy fog, impossible anatomy, oversaturated glow
```

### 5. Hero decoração

```text
Use case: product-mockup
Asset type: landing page hero for home decor products
Primary request: create a high-end lifestyle product image of 3D printed decor for shelves and side tables
Scene/background: calm interior setting with bookshelf or sideboard
Subject: one geometric vase, one small decorative light or candle holder, one tabletop accent piece, all visibly 3D printed
Style/medium: photorealistic-natural
Composition/framing: vertical composition, products grouped with breathing room
Lighting/mood: soft daylight or warm ambient interior light
Color palette: off-white, sand, graphite, muted terracotta
Materials/textures: realistic PLA textures, matte surfaces, subtle shadows
Constraints: decor must feel modern and sellable; no fake marble; no watermark
Avoid: maximalist clutter, plastic toy vibe, surreal environments
```
