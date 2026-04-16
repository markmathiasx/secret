param(
  [string]$Message = "fix: compatibilizar prisma 6 e validar login build"
)

$ErrorActionPreference = "Stop"

git add .
git commit -m $Message
git push -u origin HEAD
