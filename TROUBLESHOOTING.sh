#!/bin/bash

# MDH 3D Store - Troubleshooting Guide
# Soluções para problemas comuns

cat << 'EOF'
🔧 GUIA DE TROUBLESHOOTING - MDH 3D Store Docker
================================================

## PROBLEMA 1: Network não abre (http://localhost:3000 sem resposta)

❌ Sintoma:
   - Acesso a http://localhost:3000 não responde
   - Timeout ou "Não foi possível acessar"

✅ Solução:

   1️⃣ Verificar se container está rodando:
      $ docker ps | grep mdh-3d-store
      
      Esperado: Container rodando com porta 3000:3000

   2️⃣ Se não estiver rodando, iniciar:
      $ docker compose up -d

   3️⃣ Verificar logs:
      $ docker compose logs mdh-3d-store
      
      Procure por "Ready in Xms" ou "Starting..."

   4️⃣ Verificar porta:
      $ netstat -tuln | grep 3000  (macOS/Linux)
      $ Get-NetTCPConnection -LocalPort 3000  (Windows)
      
   5️⃣ Se porta ocupada:
      $ lsof -i :3000
      $ kill -9 <PID>
      
      Ou mudar porta em docker-compose.yml:
      - "3001:3000"  # acesse http://localhost:3001

   6️⃣ Fazer healthcheck:
      $ curl http://localhost:3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PROBLEMA 2: Imagens não carregam (404 em /catalog-assets)

❌ Sintoma:
   - Acesso a http://localhost:3000/catalogo OK
   - Miniaturas dos produtos em branco/cinza (broken image)
   - DevTools > Network: mdh-001.webp = 404

✅ Solução:

   1️⃣ Verificar se imagens existem no host:
      $ ls public/catalog-assets/mdh-*.webp
      
      Esperado: mdh-001.webp, mdh-002.webp, ... (60+ arquivos)

   2️⃣ Verificar se foram copiadas para imagem:
      $ docker exec mdh-3d-store ls /app/public/catalog-assets/ | head
      
      Esperado: mdh-001.webp, mdh-002.webp, ...

   3️⃣ Se não estão na imagem, rebuild:
      $ docker compose down
      $ docker image rm mdh-3d-store:latest
      $ docker compose up --build -d

   4️⃣ Verificar Dockerfile:
      Procure por:
      "COPY --from=builder /app/public ./public"
      
      Se missing, adicione e rebuild

   5️⃣ Testar acesso direto:
      $ curl -I http://localhost:3000/catalog-assets/mdh-001.webp
      
      Esperado: HTTP/1.1 200 OK

   6️⃣ Verificar logs de acesso:
      $ docker compose logs mdh-3d-store | grep catalog-assets

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PROBLEMA 3: Container falha ao iniciar (exited/crashed)

❌ Sintoma:
   - docker ps: "Status: Exited (1)"
   - docker ps: "Status: OOMKilled"

✅ Solução - Verificar logs:
      $ docker logs mdh-3d-store
      
   Se erro "out of memory":
   - Aumentar limite em docker-compose.yml:
     deploy:
       resources:
         limits:
           memory: 2G  (era 1G)

   Se erro "Cannot find module":
   - Rebuild sem cache:
     $ docker compose down
     $ docker build --no-cache -t mdh-3d-store:latest .

   Se erro "Supabase URL":
   - Verificar .env.docker:
     $ cat .env.docker
     NEXT_PUBLIC_SUPABASE_URL=https://vpuynsrtytsveagsuebh.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_3KH0pYxfKxivugzDmKyjkw_Vyy1JUlQ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PROBLEMA 4: Aplicação lenta ou timeout

❌ Sintoma:
   - Requests > 10 segundos
   - http://localhost:3000/catalogo demora para carregar

✅ Solução:

   1️⃣ Verificar CPU/Memory:
      $ docker stats mdh-3d-store
      
      Anote valores de CPU e MEM

   2️⃣ Se CPU/MEM altos, aumentar limite:
      Em docker-compose.yml:
      deploy:
        resources:
          limits:
            cpus: '4'  (era 2)
            memory: 2G  (era 1G)

   3️⃣ Verificar disco:
      $ docker system df
      
      Se "RECLAIMABLE" alto, fazer limpeza:
      $ docker system prune -a

   4️⃣ Verificar logs:
      $ docker logs mdh-3d-store | grep -i "error\|warn"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PROBLEMA 5: "Address already in use" (porta 3000)

❌ Sintoma:
   - docker compose up: erro "bind: address already in use"
   - Porta 3000 já ocupada

✅ Solução:

   Opção 1: Matar processo anterior
      $ lsof -i :3000
      $ kill -9 <PID>

   Opção 2: Usar porta diferente
      Em docker-compose.yml:
      ports:
        - "3001:3000"  # acesse na 3001
      
      $ docker compose up -d

   Opção 3: Ver o que está usando
      $ netstat -tulnp | grep 3000  (Linux)
      $ Get-Process | Where-Object {$_.ProcessName -eq "node"}  (Windows)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PROBLEMA 6: Hot reload não funciona (dev)

❌ Sintoma:
   - docker compose -f docker-compose.dev.yml up
   - Edita /src mas não recarrega

✅ Solução:

   1️⃣ Verificar volumes:
      $ docker inspect mdh-3d-store-dev | grep -A 5 "Mounts"
      
      Esperado: Source path -> /app/src

   2️⃣ Verificar bind mounts:
      Abra docker-compose.dev.yml
      Procure por:
      volumes:
        - ./src:/app/src

   3️⃣ Reiniciar container:
      $ docker compose -f docker-compose.dev.yml down
      $ docker compose -f docker-compose.dev.yml up

   4️⃣ Verificar arquivo foi editado:
      $ ls -la src/  # verificar timestamp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## CHECKLIST DE DEBUG

Use isso quando tudo falha:

□ Docker daemon rodando?
  $ docker ps

□ Imagem existe?
  $ docker image ls mdh-3d-store

□ Container rodando?
  $ docker ps -a | grep mdh

□ Porta mapeada?
  $ docker port mdh-3d-store

□ Aplicação respondendo?
  $ curl -I http://localhost:3000

□ Imagens carregando?
  $ curl -I http://localhost:3000/catalog-assets/mdh-001.webp

□ Logs OK?
  $ docker logs mdh-3d-store

□ Espaço em disco?
  $ docker system df

□ Recursos suficientes?
  $ docker stats mdh-3d-store

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## RESET COMPLETO (Última Resort)

⚠️ AVISO: Deleta TODOS containers e imagens

$ docker compose down
$ docker image rm mdh-3d-store:latest
$ docker container prune -f
$ docker image prune -f
$ docker system prune -a

Depois:
$ docker compose up --build -d

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## CONTATO / MAIS AJUDA

Verifique:
1. DOCKER-PRODUCTION.md (documentação completa)
2. QUICKSTART.sh (guia rápido)
3. VALIDATE.sh (teste automático)

EOF
