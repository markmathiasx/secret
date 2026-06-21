# Score Commerce OS MDH3D

Gerado em: 2026-06-21T14:18:51.831Z

| Pilar | Score |
| --- | ---: |
| E-commerce operacional | 97.4/100 |
| Catalogo visual + WhatsApp | 100/100 |
| Omnichannel marketplace | 87.89/100 |

Status final: NAO PASSOU

## Evidencias usadas

- Marketplace geral atual: 91.88%
- Catalogo publico: 848 produtos
- Jogos publicos: 11
- Feed Meta: 844 produtos, 4 ignorados
- Pricing: 848 produtos validados
- Picsum publico/smart: 0 / 0
- Security audit: ok
- Secret scan: ok

## Gaps para 100/100/100

- 1. Performance: Notas Lighthouse ou Web Vitals lab abaixo da meta
- 3. Motor de Comércio — mínimo: Sem DATABASE_URL neste ambiente; criacao real no banco nao foi provada nesta execucao local
- 3. Motor de Comércio — avançado: Credenciais Mercado Pago ausentes nesta execucao; fica fallback/sandbox
- 3. Motor de Comércio — avançado: Credenciais SMTP ausentes nesta execucao
- 7. Analytics: Capturar eventos em navegador/Tag Assistant para 100%
- 13. Deploy/Infra: Rodar docker compose build/up e registrar log
