# Catalog Semantic Audit Report

**Generated:** 2026-04-20T19:11:21.424Z
**Total SKUs:** 248

## Summary

| Metric | Count |
|--------|-------|
| Total SKUs | 248 |
| APPROVED (score >= 0.99) | 35 |
| FIX_TEXT (reclassify) | 0 |
| FIX_IMAGE | 0 |
| FIX_BOTH | 0 |
| BLOCKED | 213 |
| With 4 images on disk | 245 |
| Real product images | 38 |
| Placeholder text cards | 210 |

## Critical Finding: Placeholder Text Cards

**210 out of 248 SKUs (85%)** have placeholder text cards instead of real product images.

These are JPEG files that render as gradient cards with text like:
- Product name
- Category
- Material info  
- "Placeholder local criado automaticamente para fluxo de imagens"
- "Substitua por foto final gerada mantendo o mesmo nome do arquivo"

These are NOT product photos and must NOT be used as hero images, in structured data, or in any customer-facing context.

## mdh-057 — Organizador de Maquiagem

| Field | Value |
|-------|-------|
| Status | BLOCKED |
| Media Status | placeholder |
| Is Placeholder | true |
| Semantic Score | 0.82 |
| Final Score | N/A |
| Reason | All 4 images are placeholder text cards (uniform_size_text_card) |

**Assessment:** All 4 images for mdh-057 are placeholder text cards showing gradient backgrounds with rendered text. None show an actual makeup organizer product.

## Approved Items (35)

- **real-001** Grinder 3 Partes Premium — foto-real (score: 1)
- **real-002** Porta Creme Dental de Bancada — foto-real (score: 1)
- **real-003** Demogorgon Decorativo Premium — foto-real (score: 1)
- **real-004** Hello Kitty Jedi Colecionável — foto-real (score: 1)
- **real-005** Stencil Rick and Morty Decorativo — foto-real (score: 1)
- **real-006** Família Customizada em Miniatura — foto-real (score: 1)
- **real-007** Boneca Infantil Personalizada — foto-real (score: 1)
- **real-008** Case de Isqueiro Caveira — foto-real (score: 1)
- **real-009** Homer Pikachu Mashup Colecionável — foto-real (score: 1)
- **real-010** Medalha Maçônica Personalizada — foto-real (score: 1)
- **mdh-050** Organizador de Cabo USB — foto-real (score: 1)
- **mdh-051** Gancho para Chaves — foto-real (score: 1)
- **mdh-052** Suporte para Livros — foto-real (score: 1)
- **mdh-053** Caixa Organizadora — foto-real (score: 1)
- **mdh-054** Suporte para Plantas — foto-real (score: 1)
- **mdh-055** Prateleira Flutuante — foto-real (score: 1)
- **mdh-056** Suporte para Bicicleta — foto-real (score: 1)
- **mdh-059** Caixa para Joias — foto-real (score: 1)
- **mdh-064** Luffy One Piece Chibi — foto-real (score: 1)
- **mdh-065** Elsa Frozen Chibi — foto-real (score: 1)
- **mdh-066** Totoro My Neighbor Chibi — foto-real (score: 1)
- **mdh-067** Pikachu Pokémon Chibi — foto-real (score: 1)
- **mdh-068** Kirby Nintendo Chibi — foto-real (score: 1)
- **mdh-069** Mario Nintendo Chibi — foto-real (score: 1)
- **mdh-070** Sonic Hedgehog Chibi — foto-real (score: 1)
- **mdh-071** Polvo Oceano Articulado — foto-real (score: 1)
- **mdh-073** Dragão Oriental Articulado — foto-real (score: 1)
- **mdh-075** Coruja Floresta Articulada — foto-real (score: 1)
- **mdh-077** Cavaleiro Medieval Mini — foto-real (score: 1)
- **mdh-078** Robô Transformador BOX — foto-real (score: 1)
- **csv-cha-006** Chaveiro Emborrachado Yasuo League of Legends Estilo Gamer Resistente para Chaves e Mochila — foto-real (score: 1)
- **csv-cha-025** Chaveiro Acrílico Premium Los Santos GTA V Dupla Face para Mochila, Chaves e Setup Gamer — foto-real (score: 1)
- **csv-cha-030** Chaveiro Emborrachado Iron Man Marvel Estilo Gamer Resistente para Chaves e Mochila — foto-real (score: 1)
- **csv-uti-005** Kit Ferramenta Gamer Ahri League of Legends Organizador Utilitário para Mesa, Cabos e Setup — foto-real (score: 1)
- **csv-uti-040** Organizador Modular Eevee Pokémon para Ferramentas Leves, Peças e Acessórios Nerd — foto-real (score: 1)

## Items Needing Text Fix (0)



## Blocked Items (213)

- **mdh-001** Hello Kitty Chibi Premium — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-002** Mascote Kawaii Desk Buddy — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-003** Monstro Elétrico Pocket Mini — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-004** Espiã Mirim Chibi — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-005** Mascote Serra Articulado — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-006** Tripulante Crewmate Neon — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-007** Esfera Monstro de Bolso — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-008** Pokémon Pikachu Mini — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-009** Spy x Family Anya Chibi — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-010** Chainsaw Man Pochita — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-011** Minecraft Steve Figurine — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-012** Creeper Minecraft — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-013** Suporte para Fone Headphone — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-014** Organizador de Cabos — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-015** Suporte para Celular — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-016** Chaveiro Personalizado — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-017** Suporte para Controle PS5 — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-018** Suporte para Controle Xbox — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-019** Porta-Copos Geek — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-020** Imã de Geladeira — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-021** Suporte para Mouse — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-022** Organizador de Canetas — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-023** Suporte para Teclado — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-024** Gancho para Parede — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-025** Vaso Geométrico — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-026** Pokébola — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-027** Busto Colecionável Anime — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-028** Luminária LED Personalizada — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-029** Foto Litofania — All 4 images are placeholder text cards (uniform_size_text_card)
- **mdh-030** Quadro Decorativo — All 4 images are placeholder text cards (uniform_size_text_card)

... and 183 more
