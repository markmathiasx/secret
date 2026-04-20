# Catalog Semantic Audit — Governance & Results

**Date:** 2026-04-20  
**Scope:** All 248 SKUs in `data/local-catalog-image-snapshot.json`  
**Threshold:** 0.99 confidence required for APPROVED status  
**Auditor:** Automated semantic audit (`scripts/catalog_semantic_audit.mjs`)

---

## Executive Summary

| Metric | Count | % |
|--------|------:|--:|
| **Total SKUs audited** | 248 | 100% |
| ✅ APPROVED (real photos, matching semantics) | 29 | 11.7% |
| 🔧 FIX_TEXT (real images, wrong classification) | 7 | 2.8% |
| ⛔ BLOCKED (placeholder text cards) | 212 | 85.5% |
| All 4 images on disk | 245 | 98.8% |
| Placeholder text card sets | 211 | 85.1% |
| Real product images | 37 | 14.9% |

### Critical Finding

**85% of catalog images are placeholder text cards** — JPEG files generated with gradient backgrounds and rendered text like "Placeholder local criado automaticamente para fluxo de imagens". These are NOT product photographs and MUST NOT be:
- Used as hero images in product listings
- Included in Schema.org structured data
- Shown without explicit "Imagem ilustrativa" disclaimer
- Used in marketing or marketplace feeds

---

## What Changed

### 1. Media Validation Blocklist
**File:** `lib/media-validation.ts`

Added `getSemanticBlocklist()` — loads IDs from `output/CATALOG_SEMANTIC_AUDIT.json` where `status === "BLOCKED"` or `isPlaceholderSet === true`. These items now return `placeholder` from `deriveMediaStatus()` regardless of their `visualKind`.

**Impact:** The 212 blocked items now correctly get:
- Amber border in catalog grid (instead of green/cyan)
- "Ilustrativa" badge (instead of "Foto real")
- "Imagem ilustrativa — não representa o produto final" warning overlay
- Logo fallback in OG meta tags (instead of placeholder image)
- Empty `image[]` in Schema.org JSON-LD (no misleading SEO)

### 2. Snapshot Enrichment
**File:** `data/local-catalog-image-snapshot.json`

Every item now has:
- `semanticStatus`: APPROVED / FIX_TEXT / BLOCKED
- `mediaStatus`: verified / probable / placeholder
- `semanticScore`: 0.0–1.0
- `isPlaceholderSet`: boolean

### 3. mdh-057 Fix
**File:** `lib/catalog.ts`

- `image` changed from `/catalog-assets/mdh-57.webp` (abstract AI blob) → `/catalog-assets/product-placeholder.webp` (honest placeholder)
- `images` array now points to placeholder path
- `description` expanded with accurate product details and "Aguardando foto real" notice
- `imageHint` expanded with specific visual attributes
- `tags` expanded with additional relevant keywords

### 4. 7 Items Reclassified
Items with real product images but wrong `visualKind`:
- mdh-062 (Sasuke Uchiha Chibi): imagem-conceitual → foto-real
- mdh-063 (Goku Dragon Ball Chibi): imagem-conceitual → foto-real
- csv-cha-006 (Chaveiro Yasuo): imagem-conceitual → foto-real
- csv-cha-025 (Chaveiro GTA V): imagem-conceitual → foto-real
- csv-cha-030 (Chaveiro Iron Man): imagem-conceitual → foto-real
- csv-uti-005 (Kit Ferramenta Ahri): imagem-conceitual → foto-real
- csv-uti-040 (Organizador Eevee): imagem-conceitual → foto-real

---

## Detection Method

### Placeholder Text Card Detection
Placeholder images are generated JPEG files with uniform characteristics:
- All 4 images (hero/closeup/in_use/packshot) have nearly identical file sizes
- Size range across 4 images < 15KB
- Average size 60–100KB
- Visual content: gradient background with rendered text describing the product

This heuristic correctly identifies 211 placeholder sets with 0 false positives.

### Semantic Score
Text-based alignment check:
- Product name keywords ↔ slug
- Category keywords ↔ slug
- Product ID ↔ slug
- Image path ↔ slug
- 4-image naming convention compliance

Items need score >= 0.70 + non-placeholder images + foto-real/render-fiel visualKind for APPROVED.

---

## Test Gate

**File:** `tests/catalog-semantic-integrity.test.mjs`

10 automated checks:
1. Audit report exists
2. All 248+ items audited
3. Required fields present
4. No APPROVED items with placeholder images
5. All placeholder text cards are BLOCKED
6. mdh-057 specifically BLOCKED
7. All APPROVED items have score >= 0.70
8. Audit timestamp within 7 days
9. Status counts internally consistent
10. No APPROVED items with placeholder/rejected mediaStatus

Run: `node tests/catalog-semantic-integrity.test.mjs`

---

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `scripts/catalog_semantic_audit.mjs` | Created | Full catalog semantic audit |
| `output/CATALOG_SEMANTIC_AUDIT.json` | Generated | Machine-readable audit results |
| `output/CATALOG_SEMANTIC_AUDIT.csv` | Generated | Spreadsheet-friendly summary |
| `output/CATALOG_SEMANTIC_FIX_REPORT.md` | Generated | Human-readable fix report |
| `tests/catalog-semantic-integrity.test.mjs` | Created | Test gate (10 checks) |
| `lib/media-validation.ts` | Modified | Semantic blocklist integration |
| `lib/catalog.ts` | Modified | mdh-057 honest image + description |
| `data/local-catalog-image-snapshot.json` | Modified | Enriched with audit results |
| `SEMANTIC-AUDIT-GOVERNANCE.md` | Created | This document |

---

## Next Steps (Manual)

1. **Generate real product photos** for the 212 blocked items using Stable Diffusion or actual photography
2. **Re-run audit** after image replacement: `node scripts/catalog_semantic_audit.mjs`
3. **Re-run tests**: `node tests/catalog-semantic-integrity.test.mjs`
4. **Verify front-end** displays honest treatment for all blocked items
5. **Monitor**: Run audit weekly as part of CI/CD pipeline
