---
applyTo: "app/catalogo/**,app/checkout/**,app/admin/**,components/store/**,components/checkout/**,app/api/**"
---

Para arquivos de store, checkout, admin, catálogo e APIs:
- Preserve a arquitetura App Router
- Prefira não duplicar domínio de dados
- Não criar componentes paralelos que disputem com os existentes
- Qualquer mudança em checkout exige validação de estados e erros
- Qualquer mudança em catálogo exige validação semântica entre SKU, texto e mídia
- Qualquer mudança em admin exige checagem de RBAC/autorização
- Qualquer mudança em API exige tratamento de erro e resposta coerente
- Toda alteração relevante deve ser seguida de build/teste
