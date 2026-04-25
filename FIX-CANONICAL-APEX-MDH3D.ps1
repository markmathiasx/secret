[CmdletBinding()]
param(
    [string]$RepoRoot = "D:\mdh-3d-store",
    [string]$CanonicalUrl = "https://mdh3d.com.br"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Ensure-Dir {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
    }
}

function Read-FileText {
    param([string]$Path)
    if (Test-Path $Path) {
        return [System.IO.File]::ReadAllText($Path)
    }
    return ""
}

function Write-Utf8NoBom {
    param(
        [string]$Path,
        [string]$Content
    )
    $dir = Split-Path $Path -Parent
    if ($dir) { Ensure-Dir $dir }
    $enc = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $enc)
}

function Backup-File {
    param([string]$Path)
    if (Test-Path $Path) {
        $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
        Copy-Item $Path "$Path.bak.$stamp" -Force
    }
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

function Replace-OrWarn {
    param(
        [string]$Text,
        [string]$Pattern,
        [string]$Replacement,
        [string]$What
    )

    $newText = [regex]::Replace($Text, $Pattern, $Replacement)
    if ($newText -eq $Text) {
        Write-Host "Aviso: padrão não encontrado para $What" -ForegroundColor Yellow
    }
    return $newText
}

$RepoRoot = (Resolve-Path $RepoRoot).Path
Set-Location $RepoRoot

if (-not (Test-Path ".git")) {
    throw "Diretório não parece ser repositório git: $RepoRoot"
}

$envFiles = @(
    ".env.local",
    ".env.example",
    ".env.production.example",
    ".env.vercel.production",
    ".env.vercel.preview",
    ".env.vercel.development"
)

foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Backup-File $file
        $text = Read-FileText $file
        $text = Upsert-Env -Text $text -Key "NEXT_PUBLIC_SITE_URL" -Value $CanonicalUrl -Overwrite
        $text = Upsert-Env -Text $text -Key "AUTH_URL" -Value $CanonicalUrl -Overwrite
        $text = Upsert-Env -Text $text -Key "NEXTAUTH_URL" -Value $CanonicalUrl -Overwrite
        $text = Upsert-Env -Text $text -Key "NEXT_PUBLIC_SITE_URL_WWW" -Value "https://www.mdh3d.com.br" -Overwrite
        $text = Upsert-Env -Text $text -Key "NEXT_PUBLIC_VERCEL_FALLBACK_URL" -Value "https://mdh-3d-store.vercel.app" -Overwrite
        Write-Utf8NoBom -Path $file -Content $text
        Write-Host "Atualizado: $file" -ForegroundColor Green
    }
}

$middlewarePath = "middleware.ts"
if (Test-Path $middlewarePath) {
    Backup-File $middlewarePath
    $middleware = Read-FileText $middlewarePath

    if ($middleware -notmatch 'normalizedHost') {
        $middleware = Replace-OrWarn `
            -Text $middleware `
            -Pattern 'const canonicalHost = process\.env\.NEXT_PUBLIC_SITE_URL\s*\?\s*new URL\(process\.env\.NEXT_PUBLIC_SITE_URL\)\.host\s*:\s*"";' `
            -Replacement @'
const canonicalHost = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host
    : "";
  const normalizedHost = host.replace(/:\d+$/, "");
'@ `
            -What "canonicalHost"
    }

    $middleware = Replace-OrWarn `
        -Text $middleware `
        -Pattern 'host !== canonicalHost' `
        -Replacement 'normalizedHost !== canonicalHost' `
        -What "host compare"

    Write-Utf8NoBom -Path $middlewarePath -Content $middleware
    Write-Host "Atualizado: $middlewarePath" -ForegroundColor Green
}

$nextConfigPath = "next.config.ts"
if (Test-Path $nextConfigPath) {
    Backup-File $nextConfigPath
    $nextConfig = Read-FileText $nextConfigPath

    if ($nextConfig -notmatch "www\.mdh3d\.com\.br") {
        $redirectBlock = @'
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.mdh3d.com.br',
          },
        ],
        destination: 'https://mdh3d.com.br/:path*',
        permanent: true,
      },
'@
        $nextConfig = [regex]::Replace($nextConfig, 'return \[\s*', "return [`r`n$redirectBlock", 1)
    }

    Write-Utf8NoBom -Path $nextConfigPath -Content $nextConfig
    Write-Host "Atualizado: $nextConfigPath" -ForegroundColor Green
}

$opsPath = ".\ops\CHECKLIST-APEX-MDH3D.txt"
$ops = @'
CHECKLIST EXTERNO OBRIGATÓRIO

1. VERCEL
   - Domains:
     - mdh3d.com.br  => Primary
     - www.mdh3d.com.br => Redirect to mdh3d.com.br
   - Environment Variables / Production:
     - NEXT_PUBLIC_SITE_URL=https://mdh3d.com.br
     - AUTH_URL=https://mdh3d.com.br
     - NEXTAUTH_URL=https://mdh3d.com.br

2. HOSTINGER DNS
   - A      @      76.76.21.21
   - CNAME  www    cname.vercel-dns.com

3. REDEPLOY
   - Fazer novo deploy de produção
   - Clicar Refresh em Domains na Vercel
   - Esperar o aviso “DNS Change Recommended” sumir

4. TESTE
   - https://mdh3d.com.br deve abrir a loja
   - https://www.mdh3d.com.br deve redirecionar para https://mdh3d.com.br
   - nenhum dos dois deve cair no vercel.app
'@
Write-Utf8NoBom -Path $opsPath -Content $ops

$promptPath = ".\ops\PROMPT-APEX-MDH3D-CLAUDE.txt"
$prompt = @'
Use o agent/profile `markbot` e execute UMA RODADA ÚNICA, FINAL e IMPLACÁVEL para forçar o domínio canônico apex `https://mdh3d.com.br` na MDH 3D Store.

OBJETIVO FINAL
- `https://mdh3d.com.br` deve ser o domínio principal.
- `https://www.mdh3d.com.br` deve redirecionar permanentemente para `https://mdh3d.com.br`.
- Nenhuma navegação, canonical, sitemap, robots, metadata, callback, auth URL ou redirect deve cair em `vercel.app` quando o ambiente de produção estiver correto.

REGRAS
- Trabalhe a partir do working tree atual.
- Preserve Next.js App Router.
- Não criar SPA paralela.
- Não quebrar checkout, conta, admin, inbox, consultor ou integrações Meta já fechadas.
- Não inventar configuração externa já aplicada; apenas endurecer o código para apex canonical.
- Não hardcodar segredos.
- Não responder com plano; implemente.

ITENS OBRIGATÓRIOS
1. Garantir que `NEXT_PUBLIC_SITE_URL`, `AUTH_URL` e `NEXTAUTH_URL` usem `https://mdh3d.com.br` em exemplos, guards e documentação operacional.
2. Revisar `lib/env.ts` e qualquer helper de site URL para garantir prioridade do apex canonical em produção.
3. Revisar `middleware.ts` para garantir redirect host-based para `mdh3d.com.br`, inclusive quando o host vier como `www.mdh3d.com.br`.
4. Revisar `next.config.ts` e adicionar redirect explícito de `www.mdh3d.com.br` para `mdh3d.com.br` se ainda não estiver sólido.
5. Revisar metadata/canonical/open graph/sitemap/robots e qualquer referência a `vercel.app`.
6. Não mexer em funcionalidade externa Meta/WhatsApp se não for necessário para o domínio canônico.
7. Rodar validação final:
   - typecheck
   - build
   - se houver smoke de URLs/canonical, rodar também
8. Se houver mudanças reais:
   - git add .
   - git commit -m "fix: force apex canonical domain mdh3d.com.br"
   - git push

FORMATO FINAL OBRIGATÓRIO
Responder apenas ao final com:
1. diagnóstico real
2. arquivos alterados
3. o que foi ajustado para forçar apex canonical
4. resultado de typecheck
5. resultado de build
6. status do commit
7. status do push
8. qualquer pendência externa que ainda reste na Vercel/Hostinger

Comece agora.
'@
Write-Utf8NoBom -Path $promptPath -Content $prompt

$gitStatus = & git status --short
Write-Host ""
Write-Host "ARQUIVOS ALTERADOS:" -ForegroundColor Cyan
$gitStatus | ForEach-Object { Write-Host $_ }
Write-Host ""
Write-Host "Prompt gerado em: $promptPath" -ForegroundColor Green
Write-Host "Checklist gerado em: $opsPath" -ForegroundColor Green
Write-Host ""
Write-Host "PRÓXIMOS COMANDOS LOCAIS:" -ForegroundColor Cyan
Write-Host "npm run typecheck"
Write-Host "npm run build"
Write-Host "git add ."
Write-Host 'git commit -m "fix: force apex canonical domain mdh3d.com.br"'
Write-Host "git push"
