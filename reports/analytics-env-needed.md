# Analytics e Funil MDH 3D

Esta camada funciona em modo no-op quando as variáveis públicas não existem. Nenhum segredo é exigido no client.

Variáveis opcionais:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` ou `NEXT_PUBLIC_GA4_ID`: habilita GA4 já carregado no layout.
- `NEXT_PUBLIC_META_PIXEL_ID`: habilita Meta Pixel no `AnalyticsBridge`.
- `NEXT_PUBLIC_CLARITY_PROJECT_ID`: habilita Microsoft Clarity no `AnalyticsBridge`.

Eventos disponíveis:

- `view_item`
- `select_item`
- `add_to_cart`
- `begin_checkout`
- `purchase`
- `whatsapp_click`
- `support_chat_started`
- `support_message_sent`
- `support_product_suggested`
- `custom_quote_started`
- `intent_page_view`
- `game_play_started`

Regras:

- Usar apenas `NEXT_PUBLIC_*` no client.
- Não registrar CPF, e-mail, telefone, token, endereço ou dados de cartão.
- Se a ferramenta não estiver configurada, o evento não quebra build nem navegação.
