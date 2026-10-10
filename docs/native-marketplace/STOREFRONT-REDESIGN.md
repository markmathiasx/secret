# Revisão da experiência Flutter — 2026-10-10 UTC

Base: `387626fecb22da7169aa8b2780647a94d9874471`, a mesma versão informada pelo usuário no Windows. Alterações isoladas na branch `codex/mobile-storefront-redesign-20261010`; não representam deploy do site ou instalação no aparelho.

## Comportamento alterado

- Tema compartilhado claro/escuro com superfícies neutras, cartões brancos e abertura editorial grafite.
- Busca antes da abertura; atalhos de coleções e diretório de categorias recebidas da API. Selecionar uma categoria no diretório limpa a busca anterior, volta ao catálogo e consulta o ID selecionado.
- Navegação principal Início/Categorias/Carrinho/Conta. Favoritos passam ao cabeçalho e abrem painel com estado atualizado ao remover uma peça.
- Grid considera largura e ampliação de texto: telefone estreito e fonte ampliada usam uma coluna; larguras suficientes usam duas a quatro. Fotografias continuam usando as URLs originais, com enquadramento contain e margem para preservar a peça.
- Catálogo permite atualizar por gesto e voltar de uma seleção vazia à listagem completa.
- PageStorageKey mantém a posição de rolagem do catálogo e do diretório enquanto a tela principal existe.

## Evidência e limites

A reconciliação `npm run marketplace:phase0` foi executada antes das alterações e `git diff --check` passou. Foram acrescentados testes de callback de categoria, dimensões do grid, abertura em viewport de 320 pixels com texto ampliado e recuperação da seleção vazia. Flutter não está instalado no executor desta edição: analyze/test/build e screenshots do aplicativo NÃO foram executados localmente. A workflow existente foi ampliada para a branch de revisão, para executar analyze e testes no GitHub Actions quando houver runner disponível.

Gates do site, build Android e validação visual manual continuam pendentes. Não há alteração de API, autenticação, preço, estoque, imagens ou configuração Firebase. Checkout, frete, pagamentos, pedidos novos, chat, administração e avaliações não foram implementados por esta revisão. Não apresentar este incremento como marketplace completo nem como aplicativo homologado.

## Validação no Windows

Revisar a branch isolada em uma cópia/worktree própria, preservando a configuração privada externa. Executar `flutter pub get`, `flutter analyze`, `flutter test` e o script existente `scripts/native-marketplace/start-mobile.ps1`. Conferir Início, busca, seleção de categorias, retorno de produto, favoritos, carrinho e conta. Conferir fontes ampliadas, teclado, tema escuro e posição de rolagem. API e PostgreSQL locais precisam permanecer executando.
