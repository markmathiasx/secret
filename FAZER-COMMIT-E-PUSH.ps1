$ErrorActionPreference = "Stop"

param(
  [string]$Message = "chore: baixar imagens pendentes e atualizar catálogo"
)

git add .
git commit -m $Message
git push
