# Chaves locais e serviços reais

Execute na raiz do clone:

```sh
node scripts/security/create-development-secrets.mjs
npm run dev
```

O comando cria `.env.development.local` com quatro chaves independentes e aleatórias de 384 bits, usadas somente para assinatura de sessão/OTP em desenvolvimento. Não imprime os valores nem sobrescreve um arquivo existente. Arquivo ignorado pelo Git e excluído do contexto Docker; permissão0600 em sistemas POSIX. No Windows, proteger também a pasta com permissões NTFS da sua conta. O arquivo pertence ao servidor local; nunca importar para componentes do navegador/mobile.

As chaves não expiram automaticamente. Para revogar, remover o arquivo e gerar novamente; sessões/OTPs assinados com chaves anteriores deixam de ser válidos. A validade de sessões e OTP permanece ativa; não são acessos eternos. O gerador recusa execução em produção, hospedagem Vercel ou CI. A aplicação rejeita chaves marcadas `mdh_dev_` em produção, segredos curtos e placeholders; CSRF/OTP não usam mais segredo fixo como fallback.

`.env.development.local` é carregado pelo Next.js no desenvolvimento, não pela API Express separada. A API usa Firebase real ou emulador devidamente configurado: estas chaves não concedem acesso a ela.

Não foram criadas credenciais fictícias Mercado Pago, Firebase, Google, Apple ou transportadoras. Uma string inventada não autentica nesses provedores. É necessário configurar credenciais válidas/contratos e homologar as operações. Não copiar chaves de desenvolvimento para produção nem usar segredos no front-end. Configurações públicas de cliente Firebase são distintas das credenciais administrativas.

OTP passou para HMAC-SHA256 verdadeiro. OTPs gerados pelo hash legado devem ser renovados; a janela normal continua10 minutos. A mudança de chaves também invalida sessões antigas. Não houve rotação de chaves de produção nem alteração de dados remotos.

Testes:

```sh
node --test scripts/security/create-development-secrets.test.mjs
node scripts/security/test-secret-policy.mjs
```

Esses testes verificam geração sem sobrescrita, permissões POSIX, recusa em CI/produção, formato/independência de chaves, política de assinatura, HMAC, adulteração e expiração. Não comprovam ausência absoluta de vulnerabilidades.
