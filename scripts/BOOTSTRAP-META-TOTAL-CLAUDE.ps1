[CmdletBinding()]
param(
    [string]$RepoRoot = "D:\mdh-3d-store"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Ensure-Dir {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
    }
}

function Backup-File {
    param([string]$Path)
    if (Test-Path -LiteralPath $Path) {
        $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
        Copy-Item -LiteralPath $Path -Destination "$Path.bak.$stamp" -Force
    }
}

function Read-Text {
    param([string]$Path)
    if (Test-Path -LiteralPath $Path) {
        return [System.IO.File]::ReadAllText((Resolve-Path -LiteralPath $Path).Path)
    }
    return ""
}

function Write-Utf8NoBom {
    param(
        [string]$Path,
        [string]$Content
    )
    $parent = Split-Path -Path $Path -Parent
    if ($parent) { Ensure-Dir $parent }
    $utf8 = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8)
}

function Upsert-Env {
    param(
        [string]$Text,
        [string]$Key,
        [string]$Value,
        [switch]$Overwrite
    )

    $escaped = [regex]::Escape($Key)
    $pattern = "(?m)^$escaped=.*$"

    if ($Text -match $pattern) {
        if ($Overwrite) {
            return [regex]::Replace($Text, $pattern, "$Key=$Value")
        }
        return $Text
    }

    if ($Text.Length -gt 0 -and -not $Text.EndsWith("`n")) {
        $Text += "`r`n"
    }

    return $Text + "$Key=$Value`r`n"
}

function Get-ExistingEnvValue {
    param(
        [string]$Text,
        [string]$Key
    )
    $escaped = [regex]::Escape($Key)
    $m = [regex]::Match($Text, "(?m)^$escaped=(.*)$")
    if ($m.Success) { return $m.Groups[1].Value.Trim() }
    return $null
}

if (-not (Test-Path -LiteralPath $RepoRoot)) {
    throw "RepoRoot não encontrado: $RepoRoot"
}

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
Set-Location -LiteralPath $RepoRoot

if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot ".git"))) {
    throw "Este diretório não parece ser um repositório git: $RepoRoot"
}

$scriptsDir = Join-Path $RepoRoot "scripts"
$opsDir = Join-Path $RepoRoot "ops"
$githubDir = Join-Path $RepoRoot ".github"
$instructionsDir = Join-Path $githubDir "instructions"

Ensure-Dir $scriptsDir
Ensure-Dir $opsDir
Ensure-Dir $githubDir
Ensure-Dir $instructionsDir

$envLocalPath = Join-Path $RepoRoot ".env.local"
if (-not (Test-Path -LiteralPath $envLocalPath)) {
    Write-Utf8NoBom -Path $envLocalPath -Content ""
}

$envLocalText = Read-Text $envLocalPath
$existingMetaToken = Get-ExistingEnvValue -Text $envLocalText -Key "META_SYSTEM_USER_TOKEN"

$envTargets = @(
    Join-Path $RepoRoot ".env.local",
    Join-Path $RepoRoot ".env.example",
    Join-Path $RepoRoot ".env.production.example",
    Join-Path $RepoRoot ".env.vercel.production",
    Join-Path $RepoRoot ".env.vercel.preview",
    Join-Path $RepoRoot ".env.vercel.development"
)

foreach ($target in $envTargets) {
    if (Test-Path -LiteralPath $target) {
        Backup-File $target
        $text = Read-Text $target

        $text = Upsert-Env -Text $text -Key "NEXT_PUBLIC_SITE_URL" -Value "https://mdh3d.com.br" -Overwrite
        $text = Upsert-Env -Text $text -Key "NEXT_PUBLIC_SITE_URL_WWW" -Value "https://www.mdh3d.com.br" -Overwrite
        $text = Upsert-Env -Text $text -Key "NEXT_PUBLIC_VERCEL_FALLBACK_URL" -Value "https://mdh-3d-store.vercel.app"

        $text = Upsert-Env -Text $text -Key "META_APP_ID" -Value "SEU_META_APP_ID"
        $text = Upsert-Env -Text $text -Key "META_APP_SECRET" -Value "SEU_META_APP_SECRET"
        $text = Upsert-Env -Text $text -Key "META_VERIFY_TOKEN" -Value "SEU_META_VERIFY_TOKEN"

        if ($existingMetaToken) {
            $text = Upsert-Env -Text $text -Key "META_SYSTEM_USER_TOKEN" -Value $existingMetaToken -Overwrite
        }
        else {
            $text = Upsert-Env -Text $text -Key "META_SYSTEM_USER_TOKEN" -Value "COLE_SEU_TOKEN_APENAS_NO_ENV_LOCAL_OU_VERCEL"
        }

        $text = Upsert-Env -Text $text -Key "META_BUSINESS_ID" -Value "4453608518247627"
        $text = Upsert-Env -Text $text -Key "META_GRAPH_API_VERSION" -Value "v25.0"
        $text = Upsert-Env -Text $text -Key "META_BUSINESS_LOGIN_CONFIG_ID" -Value "2053538095194681"
        $text = Upsert-Env -Text $text -Key "META_MARKETPLACE_CREATORS_CONFIG_ID" -Value "1852036822135714"
        $text = Upsert-Env -Text $text -Key "META_INSTAGRAM_INTEGRATION_CONFIG_ID" -Value "980413751182322"
        $text = Upsert-Env -Text $text -Key "META_WHATSAPP_MEASUREMENT_PARTNER_CONFIG_ID" -Value "2567965270271995"
        $text = Upsert-Env -Text $text -Key "META_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID" -Value "2439354426585589"
        $text = Upsert-Env -Text $text -Key "META_SANDBOX_AD_ACCOUNT_ID" -Value "26517234214566303"
        $text = Upsert-Env -Text $text -Key "META_PAGE_ID" -Value "SEU_META_PAGE_ID"
        $text = Upsert-Env -Text $text -Key "META_IG_BUSINESS_ACCOUNT_ID" -Value "SEU_META_IG_BUSINESS_ACCOUNT_ID"
        $text = Upsert-Env -Text $text -Key "META_WABA_ID" -Value "SEU_META_WABA_ID"
        $text = Upsert-Env -Text $text -Key "META_PHONE_NUMBER_ID" -Value "SEU_META_PHONE_NUMBER_ID"

        $text = Upsert-Env -Text $text -Key "META_ENABLE_FACEBOOK_SDK" -Value "true"
        $text = Upsert-Env -Text $text -Key "META_ENABLE_BUSINESS_LOGIN" -Value "true"
        $text = Upsert-Env -Text $text -Key "META_ENABLE_INSTAGRAM_PUBLISH" -Value "false"
        $text = Upsert-Env -Text $text -Key "META_ENABLE_FACEBOOK_POSTING" -Value "false"
        $text = Upsert-Env -Text $text -Key "META_ENABLE_WHATSAPP_OUTBOUND" -Value "false"
        $text = Upsert-Env -Text $text -Key "META_ENABLE_MARKETING_API_SANDBOX" -Value "true"

        Write-Utf8NoBom -Path $target -Content $text
    }
}

$instructionPath = Join-Path $instructionsDir "meta-total.instructions.md"
$instructionText = @"
# Regras Meta Total + domínio

- Nunca hardcodar token, app secret, verify token ou qualquer segredo.
- Ler tudo apenas de env vars.
- Domínio final obrigatório: https://mdh3d.com.br
- Suporte também a https://www.mdh3d.com.br
- Preservar Next.js App Router.
- Não criar SPA paralela.
- Não quebrar checkout, conta, admin, inbox, catálogo ou consultor.
- Webhooks devem validar handshake e assinatura.
- Facebook JS SDK e Business Login só devem ser usados se fizer sentido para onboarding/admin, não como improviso no storefront.
- Não fingir que uma permissão Meta está implementada se ela só foi preparada.
"@
Write-Utf8NoBom -Path $instructionPath -Content $instructionText

$checklistPath = Join-Path $opsDir "META-TOTAL-CHECKLIST.txt"
$checklistText = @"
PASSOS HUMANOS APÓS A EXECUÇÃO DO CLAUDE

1. Adicionar domínios na Vercel:
   - mdh3d.com.br
   - www.mdh3d.com.br

2. Trocar o DNS atual do domínio para os registros pedidos pela Vercel.

3. Subir/envs reais na Vercel:
   - NEXT_PUBLIC_SITE_URL
   - META_APP_ID
   - META_APP_SECRET
   - META_VERIFY_TOKEN
   - META_SYSTEM_USER_TOKEN
   - META_BUSINESS_ID
   - META_PAGE_ID
   - META_IG_BUSINESS_ACCOUNT_ID
   - META_WABA_ID
   - META_PHONE_NUMBER_ID

4. Configurar webhooks Meta:
   - /api/webhooks/whatsapp
   - /api/webhooks/meta-messaging
   - /api/webhooks/instagram

5. Testar:
   - Business Login
   - WhatsApp inbound
   - Facebook Page messaging
   - Instagram DM/comment
   - inbox/admin
   - consultor/IA
   - callbacks no domínio final

6. Revogar o token de teste.
"@
Write-Utf8NoBom -Path $checklistPath -Content $checklistText

$promptPath = Join-Path $opsDir "PROMPT-META-TOTAL-CLAUDE.txt"
$promptText = @"
Use o agent/profile `markbot` e execute UMA RODADA ÚNICA, COMPLETA E CRÍTICA para fechar toda a integração pendente de Meta + Facebook + Instagram + WhatsApp Business + Business Login + Marketing API sandbox + domínio próprio `mdh3d.com.br` na MDH 3D Store, preservando Next.js App Router, sem criar SPA paralela, sem hardcode de segredo, sem expor tokens e sem fingir implementação.

VERDADE INICIAL
- Trabalhe a partir do working tree atual.
- Preserve a arquitetura atual.
- Não crie segunda loja, segunda navbar, segundo checkout ou segundo admin.
- O token Meta de teste já está configurado em env local.
- NÃO imprimir, NÃO logar, NÃO reescrever e NÃO expor nenhum token.
- Use apenas leitura de ambiente.
- Se alguma env obrigatória faltar, falhe de forma explícita e segura.
- Não declarar sucesso sem build, smoke, commit, push e evidência objetiva.

CONTEXTO META JÁ DISPONÍVEL
Considere estes IDs/configurações já existentes e use-os apenas por env/config segura, sem hardcode em frontend sensível:
- Business Login config id: 2053538095194681
- Marketplace e criadores de conteúdo config/contexto: 1852036822135714
- Integração do Instagram criada: 980413751182322
- Parceiro de mensuração do WhatsApp criado: 2567965270271995
- Configuração do cadastro incorporado do WhatsApp com token de 60 dias: 2439354426585589
- Sandbox ad account id: 26517234214566303
- Graph API version alvo: v25.0

TRECHOS/CONCEITOS OFICIAIS A CONSIDERAR
- Facebook JS SDK / FB.init / login button / FB.getLoginStatus
- Business Login
- Graph API Explorer
- Casos de uso Meta
- Ferramentas para desenvolvedores
Mas aplicar isso com arquitetura profissional do projeto atual, não como snippet jogado em página.

ESCOPO FINAL OBRIGATÓRIO
Fechar tudo o que ficou pendente em:
1. domínio `mdh3d.com.br`
2. WhatsApp Business
3. Facebook Pages / messaging
4. Instagram messaging / comments / publishing / insights quando aplicável
5. inbox/admin omnichannel
6. consultor/IA integrado a canais Meta
7. webhooks oficiais Meta
8. alertas e sinalização
9. ambiente de produção
10. documentação operacional mínima
11. Business Login para Empresas
12. preparação de Marketing API em sandbox, sem expor criação pública de campanhas

ARQUIVOS DE REFERÊNCIA OBRIGATÓRIOS
Use no workspace como referência operacional e técnica:
- `Meta Business Suite.html`
- `Explorador da Graph API - Meta for Developers.html`
- `MDH 3D — Casos de uso - Meta for Developers.html`
- `MDH 3D — Casos de uso - Meta for Developers(1).html`
- `MDH 3D — Teste - Meta for Developers.html`
- `MDH 3D — Teste - Meta for Developers(1).html`
- `Criar configuração - Meta for Developers.html`
- `Login do Facebook para Empresas _ Documentação do desenvolvedor.html`
- `Ferramentas para desenvolvedores - Meta for Developers.html`
- `mdh3d.com.br.txt`
- `whatsapp-business-jaspers-market-main.zip`

NÃO copie cegamente.
Extraia apenas o que for aplicável ao projeto atual.

PERMISSÕES / CAPACIDADES META A CONSIDERAR
- instagram_basic
- instagram_branded_content_ads_brand
- instagram_branded_content_brand
- instagram_content_publish
- instagram_manage_comments
- instagram_manage_contents
- instagram_manage_insights
- instagram_manage_messages
- instagram_shopping_tag_products
- manage_app_solution
- pages_manage_engagement
- pages_manage_posts
- pages_read_user_content
- pages_utility_messaging
- paid_marketing_messages
- read_insights
- threads_business_basic
- whatsapp_business_manage_events

REGRA DE REALIDADE
- Não fingir que “todas as ferramentas do HTML” viraram features do site.
- Auditar todas as ferramentas e casos de uso mostrados nos HTMLs.
- Implementar no site/admin/inbox tudo que for realmente aplicável.
- O que não for aplicável agora deve ficar documentado como `implementado`, `preparado` ou `descartado`, com motivo técnico/comercial claro.

FASE 1 — AUDITORIA CIRÚRGICA
Audite e localize exatamente:
- rotas atuais de chat
- rotas atuais de WhatsApp
- webhook Meta/Instagram/Facebook existentes
- inbox/admin atual
- consultor/IA atual
- envs Meta atuais
- domínio e configuração de site URL
- qualquer integração parcial já existente
- gaps reais de autenticação, webhook, inbox, tokenização, painel e deploy

FASE 2 — DOMÍNIO PRÓPRIO
Fechar a migração para `mdh3d.com.br`:
- substituir `NEXT_PUBLIC_SITE_URL` e equivalentes para o domínio final
- ajustar canonical, metadata, open graph, robots e sitemap
- ajustar callbacks/webhooks para o domínio final
- revisar qualquer referência fixa a `vercel.app`
- preparar o projeto para funcionar com:
  - `https://mdh3d.com.br`
  - `https://www.mdh3d.com.br`

FASE 3 — CAMADA META ORGANIZADA
Criar/ajustar:
- `lib/meta/config.ts`
- `lib/meta/signature.ts`
- `lib/meta/graph-api.ts`
- `lib/meta/whatsapp.ts`
- `lib/meta/facebook-pages.ts`
- `lib/meta/instagram.ts`
- `lib/meta/marketing-api.ts`
- `lib/meta/business-login.ts`
- `lib/meta/facebook-sdk.ts`
- `lib/meta/types.ts`
- `lib/meta/normalizers.ts`

Essa camada deve:
- ler env vars com segurança
- validar campos obrigatórios
- encapsular Graph API
- normalizar eventos/mensagens
- validar assinatura
- tratar retry/erro
- nunca vazar segredo em log

FASE 4 — FACEBOOK JS SDK E BUSINESS LOGIN
Implementar o que for realmente útil e seguro para o projeto:
- Business Login para Empresas com `config_id`
- fluxo server-side seguro para troca/uso de credenciais
- callback dedicado
- uso do Facebook JS SDK apenas onde fizer sentido
- não usar SDK como gambiarra para recurso que deve ficar no backend
- se houver botão/login de conexão Meta no admin, implementar de forma limpa
- não transformar isso em login público da loja sem necessidade

FASE 5 — WEBHOOKS OFICIAIS
Implementar/fechar corretamente:
1. `app/api/webhooks/whatsapp/route.ts`
2. `app/api/webhooks/meta-messaging/route.ts`
3. `app/api/webhooks/instagram/route.ts`

OBRIGATÓRIO
- GET handshake com `hub.mode`, `hub.verify_token`, `hub.challenge`
- POST validando `x-hub-signature-256`
- parsing robusto
- idempotência
- persistência no inbox
- resposta rápida e segura
- logs úteis sem segredo

FASE 6 — INBOX / ADMIN OMNICHANNEL
Expandir o inbox/admin atual para suportar:
- `site`
- `whatsapp`
- `facebook_page`
- `instagram_dm`
- `instagram_comments` quando aplicável

O inbox/admin deve permitir:
- listar conversas
- filtrar por canal
- filtrar por status
- atribuir conversa
- tags
- notas internas
- resolver
- arquivar
- reabrir
- unread badges
- origem do lead
- página/produto de origem quando existir
- histórico persistido
- resposta humana

FASE 7 — CONSULTOR / IA
Conectar o consultor/assistente atual a essa malha:
- IA responde pré-venda
- handoff para humano
- histórico persistido
- contexto do produto atual
- contexto do canal
- nunca inventar dados críticos
- refletir no inbox/admin
- não quebrar UX atual

FASE 8 — FACEBOOK / INSTAGRAM / TOOLS APLICÁVEIS
Auditar os HTMLs e implementar tudo que for aplicável ao site/admin agora, incluindo:
- leitura de mensagens
- gestão de comentários quando suportado
- publicação de conteúdo se houver superfície admin adequada
- insights básicos no admin
- origem por canal
- últimos eventos
- base para campanhas/ads se houver superfícies úteis no escopo atual
- preparar integração com shopping/tag de produtos somente se o catálogo atual suportar isso corretamente

Para cada ferramenta/caso de uso do HTML, classificar:
- `implementado`
- `preparado`
- `descartado`
E justificar tecnicamente.

FASE 9 — MARKETING API SANDBOX
Se `META_SANDBOX_AD_ACCOUNT_ID` existir:
- criar camada segura e admin-only para campanhas sandbox/draft
- não expor criação de campanha ao público
- usar status pausado por padrão
- tratar como ferramenta interna/admin
- se houver superfície admin útil, implementar criação/consulta controlada de campanha sandbox
- nunca operar mídia paga em produção sem governança

FASE 10 — ALERTAS
Implementar alerta operacional para:
- novo lead no site
- nova mensagem via WhatsApp
- nova DM/comentário Meta aplicável
- erro de webhook
- falha de envio
Com:
- registro
- reflexo no inbox/admin
- anti-spam
- auditoria mínima

FASE 11 — SEGURANÇA
Obrigatório:
- zero token hardcoded
- uso apenas de env
- assinatura validada
- rate limit em endpoints sensíveis
- logs sem PII excessiva
- falha segura quando env faltar
- nenhuma regressão em checkout, conta, admin ou catálogo

FASE 12 — TESTES
Criar/ajustar testes mínimos para:
- handshake GET
- assinatura inválida
- payload válido WhatsApp
- payload válido Meta messaging
- payload válido Instagram
- Business Login callback/config
- criação de conversa no inbox
- render de canal no admin
- build sem regressão

FASE 13 — VALIDAÇÃO FINAL
Rodar e provar:
- lint
- typecheck
- build
- smoke local
- testes Meta
- testes inbox/admin
- testes consultor/chat
- validar rotas críticas:
  - home
  - catálogo
  - PDP
  - checkout
  - conta
  - admin
  - inbox
- validar referências ao domínio final

FASE 14 — COMMIT / PUSH
Se houver mudanças reais:
- git add .
- git commit -m "<mensagem profissional e específica>"
- git push origin main
Sem force-push, salvo bloqueio crítico documentado.

CRITÉRIO DE ACEITE
Não encerrar enquanto qualquer um destes itens estiver aberto:
- domínio final não preparado
- webhook sem assinatura validada
- token exposto em código
- env insegura
- inbox sem canal Meta/WhatsApp funcional
- conversas não persistindo
- admin sem filtros/estado mínimos
- build falhando
- smoke falhando
- ausência de evidência objetiva

FORMATO FINAL OBRIGATÓRIO
Responder apenas ao final com:
1. diagnóstico real
2. o que já existia
3. o que foi implementado agora
4. status do domínio `mdh3d.com.br`
5. status do Business Login
6. quais ferramentas/casos de uso dos HTMLs foram implementados
7. quais ficaram apenas preparados
8. quais foram descartados e por quê
9. arquivos alterados/criados
10. resultado de lint/typecheck/build/testes
11. status do commit
12. status do push
13. pendências reais restantes
14. quais envs ainda precisam de valor real para produção

REGRA FINAL
Não imprimir token.
Não hardcodar segredo.
Não fingir integração pronta.
Não parar no meio.
Comece agora.
"@
Write-Utf8NoBom -Path $promptPath -Content $promptText

try {
    Set-Clipboard -Value $promptText
} catch {
}

Write-Host ""
Write-Host "PRONTO." -ForegroundColor Green
Write-Host "Script salvo em: $PSCommandPath"
Write-Host "Prompt gerado em: $promptPath"
Write-Host "Checklist gerado em: $checklistPath"
Write-Host "O prompt foi copiado para a área de transferência, se o sistema permitir."
Write-Host ""
Write-Host "AGORA FAÇA:"
Write-Host "1. Abra o Claude no VS Code"
Write-Host "2. Cole o prompt"
Write-Host "3. Rode"
Write-Host "4. Depois aplique DNS/Vercel/webhooks e revogue o token de teste"
