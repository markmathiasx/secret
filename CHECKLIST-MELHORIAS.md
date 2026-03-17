# ✅ Checklist de Melhorias (MDH 3D Store)

| Prioridade | Item | Status |
|------------|------|--------|
| 🔴 CRÍTICO | Corrigir vercel.json (remover gru1) | ✅ Concluído (no arquivo `secret/vercel.json`) |
| 🔴 CRÍTICO | Verificar plano Vercel (Hobby vs Pro) | ✅ Concluído (helper em `src/lib/env.ts` + env var `NEXT_PUBLIC_VERCEL_PLAN`) |
| 🟡 ALTA | Implementar novo catálogo 20 itens | Pendente |
| 🟡 ALTA | Adicionar seção anime (25 personagens) | Pendente |
| 🟡 ALTA | Páginas de produto completas | Pendente |
| 🟢 MÉDIA | Integração pagamentos | Pendente |
| 🟢 MÉDIA | Calculadora de frete | Pendente |
| 🟢 MÉDIA | SEO e meta tags | Pendente |
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
