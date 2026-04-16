param(
  [string]$Message = "chore: baixar imagens pendentes e atualizar catálogo"
)

$ErrorActionPreference = "Stop"

git add .
git commit -m $Message
git push -u origin HEAD
