# MDH 3D — aplicativo e API

Este diretório é o contrato de entrega do aplicativo. Código em `apps/mdh_mobile` e `services/marketplace-api`; o site Next.js existente continua independente. A presença de código não prova publicação, integração com o site, homologação financeira nem aprovação das lojas.

## Documentos

- [Especificação e critérios de aceitação](SPECIFICATION.md)
- [Arquitetura e modelo de dados de destino](ARCHITECTURE.md)
- [Seis sprints com gates de saída](DELIVERY.md)
- [Configuração, implantação e recuperação](OPERATIONS.md)
- [Evidências desta entrega](VERIFICATION.md)

## Regras comerciais

Fotos de produtos precisam ser originais ou licenciadas e corresponder à peça vendida. Arte conceitual pertence à marca, nunca à ficha comercial. Nenhum contador, review, estoque ou selo é inventado. Preço é calculado no servidor, em centavos. Nenhum arquivo de marketplace é importado automaticamente sem licença comercial, capacidade de produção e validação da imagem.

O adaptador Pix tem testes isolados. O checkout da nova API não é liberado por ter um token: depende também de estado financeiro persistente, processamento idempotente, conciliação, estornos e testes sandbox. Configurações ausentes devem produzir indisponibilidade explícita.

O catálogo novo não é uma cópia automática da base atual do site. Compartilhar clientes, pedidos e estoque exige migração e contrato de identidade revisados. Não vincular contas de dois provedores apenas porque os e-mails são iguais.
