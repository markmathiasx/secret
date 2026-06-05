import fs from "node:fs";
import path from "node:path";
import { ROOT, writeJson } from "./catalog/ts-runtime.mjs";

const requiredFiles = [
  ["enterprise/README.md", ["cpp-slicer", "python-ai", "java-order-service", "ts-telemetry"]],
  ["enterprise/cpp-slicer/include/slicer_engine.h", ["SlicerEngine", "PrintConfig", "ConcurrentQueue", "ThreadPool", "extern \"C\""]],
  ["enterprise/cpp-slicer/src/slicer_engine.cpp", ["estimateBox", "logResult", "mdh3d_estimate_minutes"]],
  ["enterprise/cpp-slicer/CMakeLists.txt", ["add_library", "CXX_STANDARD"]],
  ["enterprise/python-ai/src/defect_detection.py", ["asyncio", "DefectResult", "REDIS_URL", "LocalStore"]],
  ["enterprise/python-ai/src/recommendation_engine.py", ["Recommendation", "local_recommend", "sklearn"]],
  ["enterprise/python-ai/requirements.txt", ["redis", "scikit-learn"]],
  ["enterprise/java-order-service/pom.xml", ["maven.compiler.source", "java-order-service"]],
  ["enterprise/java-order-service/src/main/java/br/com/mdh3d/orders/OrderSagaService.java", ["OrderSagaService", "idempotencyKey", "ORDER_ACCEPTED"]],
  ["enterprise/java-order-service/src/main/java/br/com/mdh3d/orders/dto/OrderCommand.java", ["record OrderCommand"]],
  ["enterprise/java-order-service/src/main/java/br/com/mdh3d/orders/dto/OrderEvent.java", ["record OrderEvent"]],
  ["enterprise/ts-telemetry/websocket-server.ts", ["z.object", "TelemetryEvent", "createServer"]],
  ["enterprise/ts-telemetry/telemetry-route-example.ts", ["NextResponse", "invalid_telemetry"]],
  ["enterprise/infra/terraform/main.tf", ["terraform", "blueprint"]],
  ["enterprise/infra/kubernetes/deployment.yaml", ["kind: Deployment", "kind: Service"]],
];

const errors = [];
const checked = [];

for (const [relative, tokens] of requiredFiles) {
  const absolute = path.join(ROOT, relative);
  if (!fs.existsSync(absolute)) {
    errors.push(`arquivo ausente: ${relative}`);
    continue;
  }
  const text = fs.readFileSync(absolute, "utf8");
  for (const token of tokens) {
    if (!text.includes(token)) errors.push(`${relative} sem token ${token}`);
  }
  checked.push(relative);
}

writeJson("reports/enterprise-scaffold-validation-report.json", {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  checked,
  errors,
});

if (errors.length) {
  console.error("Falha em validate-enterprise-scaffold:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`OK: scaffold enterprise validado com ${checked.length} arquivos.`);
