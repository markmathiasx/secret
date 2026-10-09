# Contrato funcional e critérios de aceitação

## Produto

Marketplace brasileiro de peças físicas e serviços de impressão 3D. Arquivos digitais STL são um tipo comercial separado, com licença, entrega digital e política de pagamento próprias. Comprador, vendedor, suporte e administrador são papéis distintos. A concessão de papel privilegiado nunca vem de um formulário público.

Identidade visual: grafite, superfícies discretas, dourado/âmbar como destaque, boa legibilidade; versão clara equivalente. Sem referências religiosas públicas. Texto comercial direto e acessível, sem promessa de renda, entrega ou qualidade não comprovada.

## Matriz de escopo

`Base` significa código inicial; `pendente` significa que não foi entregue. Estado efetivo e verificações ficam em VERIFICATION.md. Esta matriz não substitui prova runtime.

| Área | Entrega base | Trabalho necessário para fechar a exigência |
| --- | --- | --- |
| E-mail/senha | Flutter com Firebase configurável e validação de token na API | Verificação de e-mail, recuperação, exclusão e testes reais |
| Google/Apple | Entrada configurável no app | Habilitar provedores, OAuth, domínios, certificados e testes em dispositivos |
| Telefone/Facebook/OTP | Pendente | SMS, quotas, antiabuso, aprovação Facebook e fluxos completos |
| Perfil comprador/vendedor | Identidade e papel no servidor | Foto, capa, bio, portfólio, verificação KYC e critérios dos selos |
| Endereços | Consulta, cadastro e exclusão na API e conta Flutter | Edição, endereço padrão, CEP validado e integração no checkout |
| Favoritos | Persistência local no app | Lista cloud, compartilhamento e sincronização por conta |
| Pedidos | Consulta autenticada na API e conta Flutter | Compra real, detalhe, cancelamento, devolução e acompanhamento completo |
| Privacidade/notificações | Pendente | Preferências granulares, consentimentos e histórico |
| Catálogo/busca | Categorias, texto e paginação na API/app | Recomendações personalizadas, relevância e métricas sem dados sensíveis |
| Voz/imagem | Pendente | Permissão de microfone, reconhecimento e índice de embeddings de fotos licenciadas |
| Filtros | Categoria e texto | Preço, cor, material, reputação, cidade, jogos e personagens com taxonomia própria |
| Visualização 3D | Detalhe com URL de modelo válido quando existente | Rotação no card com orçamento de GPU; ARKit/ARCore em dispositivos compatíveis |
| Promoções | Pendente | Campanhas com início/fim reais, estoque limitado e preço anterior auditável |
| Moedas/cashback | Pendente | Ledger imutável, expiração, reversão de estorno e regras antifraude |
| Publicidade | Pendente | Anúncios identificados, orçamento, cobrança, moderação e relatórios |
| Carrinho | App local e rotas cloud na API | Convergência, multi-device, estoque/variantes e operações idempotentes |
| Frete | Pendente | Cotações contratuais Correios/transportadoras, validade, origem por vendedor |
| Checkout/Pix | Adaptador Mercado Pago; checkout desativado | Pedido transacional, idempotência durável, webhook inbox, conciliação e sandbox |
| Cartão/12x/antifraude | Pendente | Tokenização do gateway, parcela elegível, 3DS, fraude e chargeback |
| Split/boleto | Pendente | Onboarding financeiro dos vendedores, produto contratual habilitado e estornos proporcionais |
| Entrega/retirada | Pendente | Reserva de estoque, opção por vendedor, regras, etiqueta e rastreio real |
| Chat | Pendente | Participantes autorizados, mensagens duráveis, leitura, digitação e anexos seguros |
| Áudio/STL/grupos | Pendente | Tamanho máximo, antivírus, assinatura de download e política de retenção |
| Reviews | Pendente | Compra entregue verificável, uma avaliação por item, fotos/vídeos moderados |
| Reputação | Pendente | Fórmula transparente, volume mínimo, envio dentro do prazo e disputas |
| Painel vendedor | Cadastro/edição de produtos sob ownership na API | Dashboard, variantes, batch upload, cotações, estoque e NFe externa |
| Administração | Papel administrativo guardado no servidor | Moderação, disputas, taxas, campanhas, suspensão e estornos com auditoria |
| Push/realtime/badges | Pendente | FCM/APNs, consentimento, tokens por dispositivo, inbox e eventos por usuário |
| Offline | Carrinho/favoritos e referências de produtos salvos localmente | Cache de catálogo/mídia, fila persistente, conflitos, retries e sincronização automática auditada |
| Segurança/LGPD | Base de autenticação, validação e ownership | Retenção, acesso/exportação/exclusão, contratos, threat model e ensaio de incidente |
| Testes/publicação | Testes isolados/API e fonte Flutter | Cobertura medida ≥80%, e2e nativo, dispositivos, assinatura e revisão das lojas |
| Figma | Não produzido | Protótipo navegável de todos os fluxos e revisão humana de usabilidade |

## Taxonomia e mídia

Separar **tipo de peça** (chibi, chaveiro, casa/organização), **universo** (games/anime/autoral), **jogo** (Valorant, League of Legends etc.) e **personagem**. Um item pode ter várias tags, mas chaveiro é um tipo obrigatório, não inferido de palavras na descrição. URL semântica por categoria; filtros por identificadores estáveis. Combinar filtros com AND, valores dentro do mesmo filtro com OR. Contagens e facets usam o mesmo predicado da consulta. Categoria vazia apresenta explicação e remoção dos filtros, nunca mistura itens para parecer preenchida.

Cadastro exige título, descrição de dimensões/material/acabamento, preço, custo, prazo de fabricação, SKU/variantes, fotos verificadas e licença. Novos itens permanecem rascunhos até aprovação. Não reduzir preços automaticamente em R$2 abaixo de concorrentes: preço final precisa cobrir material, máquina, acabamento, mão de obra, taxas, embalagem, perdas, imposto e margem. Comparáveis devem ter dimensões/quantidade/acabamento equivalentes e fonte/data registradas.

## Fluxos e aceitação

1. **Descoberta:** abrir app → escolher categoria → buscar → carregar próxima página → detalhe. Retorno preserva filtros/rolagem; erros permitem retry; preço e disponibilidade vêm do servidor.
2. **Conta:** cadastro → verificação → login → endereço. Conta suspensa recebe bloqueio também com token válido. Administrador precisa MFA e concessão fora do cadastro.
3. **Compra:** carrinho → endereço/frete → revisão → pagamento → pedido. Qualquer custo aparece antes do aceite. O servidor recalcula total e não aceita total informado pelo cliente.
4. **Pós-compra:** status → rastreio → confirmação → review ou disputa. Reentrega de webhook nunca gera baixa dupla nem cashback duplicado.
5. **Personalizado:** upload privado STL → validação/scan → orçamento com prazo/validade → aprovação → pedido. Nenhum STL privado vira asset público.
6. **Vendedor:** cadastro/KYC → produto em revisão → publicado → pedido → produção → envio → liquidação. Editar preço não modifica snapshots de pedidos antigos.

## Qualidade mensurável

- Testar larguras 320, 360, 390, 430, 768 e 1024; texto 200%, TalkBack/VoiceOver, teclado e foco. Alvos de toque ≥48dp; rótulos de erro compreensíveis.
- 60fps é meta medida em dispositivos de referência; viewer 3D carrega sob demanda e pausa fora da tela. Não garantir AR em aparelhos sem suporte.
- Definir SLO da API em carga representativa (p95 catálogo <300ms em cache, erros <1%) e testar capacidade. 10 mil conexões não equivale a 10 mil compras concorrentes; registrar cenário, hardware e taxa.
- Cobertura ≥80% é gate futuro medido, com suites de autorização, pagamento, concorrência, recuperação e regressões. Número de testes isolado não comprova cobertura.
- Nenhuma fase é concluída sem caminho app → API → banco real em staging, evidência por SHA e aceitação comercial.
