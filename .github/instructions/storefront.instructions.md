---
applyTo: "app/catalogo/**,components/catalog-grid.tsx,lib/catalog-*.ts,lib/media-*.ts,app/api/catalog/**,app/api/products/**,app/checkout/**,app/admin/**,app/api/**"
---
- Validar coerência SKU x mídia x texto.
- Não expor BLOCKED, placeholder ou needs_review no catálogo público.
- Em checkout e admin: validar estados de erro, RBAC e regressões.
- Em catálogo: priorizar honestidade visual e imagens válidas.
