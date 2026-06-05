# MDH 3D Enterprise Blueprint

Este diretorio e uma base local-first para evolucao tecnica da MDH 3D. Ele nao e acoplado ao build principal Next.js e nao exige cloud paga, credenciais ou servicos externos para existir no repositorio.

## Modulos

- `cpp-slicer`: motor C++ inicial para estimativa de fatiamento, fila concorrente, pool de threads e ABI C minima.
- `python-ai`: prototipos async para deteccao de falhas e recomendacao com fallback local.
- `java-order-service`: servico Maven conceitual para saga de pedidos e idempotencia.
- `ts-telemetry`: servidor WebSocket e exemplo de rota para telemetria validada por Zod.
- `infra`: blueprints Terraform e Kubernetes. Nao aplique sem revisar variaveis e custos.

## Como rodar localmente

### C++

```bash
cd enterprise/cpp-slicer
cmake -S . -B build
cmake --build build
```

### Python

```bash
cd enterprise/python-ai
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt
python src/defect_detection.py
python src/recommendation_engine.py
```

Redis e scikit-learn sao opcionais. Se nao existirem, os scripts usam fallback local.

### Java

```bash
cd enterprise/java-order-service
mvn test
```

### TypeScript Telemetry

```bash
cd enterprise/ts-telemetry
npm install
npx tsx websocket-server.ts
```

## Integracao futura

Integre esses modulos somente quando houver fluxo real: pedidos, telemetria de impressora, recomendacao validada ou fila de producao. A loja publica continua usando o Next.js principal.
