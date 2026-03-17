# ✅ Checklist de Melhorias (MDH 3D Store)

| Prioridade | Item | Status |
|------------|------|--------|
| 🔴 CRÍTICO | Corrigir vercel.json (remover gru1) | ✅ Concluído (no arquivo `secret/vercel.json`) |
| 🔴 CRÍTICO | Verificar plano Vercel (Hobby vs Pro) | ✅ Concluído (helper em `src/lib/env.ts` + env var `NEXT_PUBLIC_VERCEL_PLAN`) |
| 🟡 ALTA | Implementar novo catálogo 20+ itens | ✅ Concluído (77 itens no catálogo) |
| 🟡 ALTA | Adicionar seção anime (10+ personagens) | ✅ Concluído (10 personagens anime adicionados) |
| 🟡 ALTA | Páginas de produto completas | ✅ Concluído (galeria, variantes, aviso licença, personalização) |
| 🟢 MÉDIA | Integração pagamentos | ✅ Concluído (Mercado Pago implementado) |
| 🟢 MÉDIA | Calculadora de frete | ✅ Concluído (calculadora CEP + zonas de entrega) |
| 🟢 MÉDIA | SEO e meta tags | ✅ Concluído (Open Graph, Twitter Cards, Schema.org JSON-LD) |
| 🟢 BAIXA | Blog/tutoriais impressão 3D | Pendente |
| 🟢 BAIXA | Sistema de reviews | Pendente |

---

## 📞 Suporte Vercel

Se o problema persistir após corrigir o `vercel.json`:

1. Acesse **vercel.com/dashboard**
2. Vá em **Settings → Deployments**
3. Clique em **"Resume Deployment"** se disponível
4. Ou contate suporte: **support@vercel.com**

**Importante:** Para e-commerce comercial, considere upgrade para **Pro Plan** [[50]], [[52]]

---

## Próximos passos recomendados

- Confirmar que o deploy do projeto não está suspenso (Vercel fornece aviso na UI).
- Verificar se `NEXT_PUBLIC_VERCEL_PLAN` está configurado corretamente no ambiente de produção.
- Implementar aviso no frontend para planos Hobby (ex.: banner/alerta).
- Terminar o catálogo e páginas de produto com variantes, galerias e SEO.
