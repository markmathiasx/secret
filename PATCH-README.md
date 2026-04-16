PATCH V3

Este pacote corrige os dois erros do fluxo anterior:

1. O script falhava quando `data/catalog-photo-manifest.json` não existia.
2. O APLICAR-PATCH.ps1 tentava copiar arquivo por cima dele mesmo.

Como usar:
1. Extraia este ZIP por cima da raiz do projeto.
2. Entre no repositório no PowerShell.
3. Rode:
   powershell -ExecutionPolicy Bypass -File .\APLICAR-PATCH.ps1
4. Coloque as fotos em input\real-photos
5. Rode:
   npm install
   npm run catalog:import-real
   npm run build

Formato dos arquivos:
- mdh-050.jpg
- mdh-050-2.jpg
- mdh-051-1.png
