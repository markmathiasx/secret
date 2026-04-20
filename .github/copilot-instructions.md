# MDH 3D Store — instruções obrigatórias para o Copilot

Este projeto é uma storefront Next.js App Router.
Nunca transforme o projeto em uma SPA paralela.
Nunca crie uma segunda loja paralela.
Nunca quebre o layout atual.
Nunca substitua a identidade visual atual sem pedido explícito.

## Arquitetura
- Preservar App Router
- Providers globais devem ser montados via wrapper client no layout
- Navegação interna deve usar next/link
- APIs devem usar app/api route handlers
- SEO de PDP deve usar generateMetadata quando aplicável
- Preferir Server Components onde fizer sentido e Client Components apenas onde necessário

## Regras de verdade
- Não inventar integração
- Não declarar deploy sem prova
- Não declarar push sem prova
- Não tratar TEST como PROD
- Não tratar placeholder como foto real
- Não tratar imagem errada como válida
- Não mascarar falhas

## Ordem de prioridade
1. Estabilidade pública
2. Segurança
3. Login/reset/admin
4. Checkout
5. Conta/pedidos
6. Catálogo/mídia
7. SEO/structured data
8. Performance/a11y
9. Refino visual

## Obrigatório antes de encerrar
- rodar lint
- rodar typecheck
- rodar build
- rodar testes relevantes
- listar arquivos alterados
- commit
- push tentado de verdade

## Catálogo
- Validar nome, slug, descrição, categoria, hero, galeria, alt text
- Se houver 1 imagem verdadeira, ela pode ser usada como semente para encontrar outras do mesmo item
- Só publicar imagens adicionais com confiança >= 0.99
- Se não houver confiança suficiente, bloquear ou marcar needs_review

## Checkout
- guest checkout forte
- estados claros
- menos ansiedade visual
- resumo do pedido consistente
- validar Pix/cartão sem exagerar foco em Pix

## Segurança
- nunca expor segredos
- nunca logar PII sem necessidade
- endurecer autenticação, sessão e reset
- mensagens neutras para login/reset
