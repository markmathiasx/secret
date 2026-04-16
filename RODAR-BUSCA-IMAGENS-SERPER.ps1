$ErrorActionPreference = "Stop"

if (!(Test-Path ".env.local")) {
  throw ".env.local não encontrado. Rode .\CONFIGURAR-SERPER.ps1 primeiro."
}

npm install
npm run catalog:fill-images
