# 03 Riscos de Seguranca

## Evidencia atual

| Area | Resultado |
| --- | --- |
| Security audit | OK, sem achados criticos |
| Secret scan | OK, 0 achados atuais e historicos em 311 commits |
| Headers | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy e Permissions-Policy presentes no relatorio |
| Admin routes | Rotas admin marcadas como protegidas no relatorio |
| Uploads | Extensoes e validacao de assinatura verificadas pelo script |
| Public copy | 401 arquivos publicos sem copy proibida |
| PI risk | 0 achados no relatorio marketplace |

## Riscos residuais

| Risco | Status | Tratamento |
| --- | --- | --- |
| Rotas admin sem rate limit individual em todos os endpoints | Observado no relatorio como `hasRateLimit: false` em algumas rotas admin | Manter protecao admin e adicionar rate limit por rota em APIOps |
| Credenciais reais ausentes no ambiente local | Mercado Pago/SMTP nao comprovados nesta execucao | Registrar pendencia; nao hardcodar credenciais |
| Analytics runtime sem captura DebugView | Pendente | Validar em navegador/Tag Assistant quando credenciais estiverem configuradas |
| Docker build nao comprovado | Pendente | Executar build Docker quando ambiente permitir |
| Produtos com imagem publica ausente no feed | 4 itens pulados com seguranca | Curadoria de imagens antes de incluir no feed |

## Regras permanentes reforcadas

- Nao commitar `.env`, tokens, senhas, cookies ou secrets.
- Nao automatizar login/captcha em marketplaces.
- Nao publicar em marketplace sem credencial oficial e revisao humana.
- Nao usar `localhost`, `blob:`, `data:` ou `javascript:` em feeds publicos.
- Nao tratar placeholder como foto real.
- Nao alterar precos em massa sem backup, dry-run, margem minima e rollback.
