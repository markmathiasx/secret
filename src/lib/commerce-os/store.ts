import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  CommerceAiObservation,
  CommerceJobExecutionRecord,
  CommerceOsLedger,
} from "@/src/lib/commerce-os/types";

const commerceOsLedgerPath = path.join(process.cwd(), "data", "industrial-v6", "operations-ledger.json");

function nowIso() {
  return new Date().toISOString();
}

function createDefaultLedger(): CommerceOsLedger {
  return {
    version: 1,
    updatedAt: nowIso(),
    printers: [
      {
        id: "bambu-a1",
        label: "Bambu Lab A1",
        active: true,
        configuredHoursPerDay: null,
        notes: "Capacidade diária ainda não configurada neste repositório.",
      },
      {
        id: "bambu-a1-mini",
        label: "Bambu Lab A1 Mini",
        active: true,
        configuredHoursPerDay: null,
        notes: "Capacidade diária ainda não configurada neste repositório.",
      },
    ],
    orders: [],
    consumables: [],
    defects: [],
    qualityChecks: [],
    packagingChecks: [],
    aiObservability: [],
    jobExecutions: [],
  };
}

function sanitizeLedger(input: Partial<CommerceOsLedger> | null | undefined): CommerceOsLedger {
  const base = createDefaultLedger();
  if (!input) return base;
  return {
    ...base,
    ...input,
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : base.updatedAt,
    printers: Array.isArray(input.printers) && input.printers.length ? input.printers : base.printers,
    orders: Array.isArray(input.orders) ? input.orders : [],
    consumables: Array.isArray(input.consumables) ? input.consumables : [],
    defects: Array.isArray(input.defects) ? input.defects : [],
    qualityChecks: Array.isArray(input.qualityChecks) ? input.qualityChecks : [],
    packagingChecks: Array.isArray(input.packagingChecks) ? input.packagingChecks : [],
    aiObservability: Array.isArray(input.aiObservability) ? input.aiObservability : [],
    jobExecutions: Array.isArray(input.jobExecutions) ? input.jobExecutions : [],
  };
}

export function readCommerceOsLedger() {
  if (!existsSync(commerceOsLedgerPath)) {
    return createDefaultLedger();
  }

  try {
    return sanitizeLedger(JSON.parse(readFileSync(commerceOsLedgerPath, "utf8")) as Partial<CommerceOsLedger>);
  } catch {
    return createDefaultLedger();
  }
}

export function writeCommerceOsLedger(next: CommerceOsLedger) {
  mkdirSync(path.dirname(commerceOsLedgerPath), { recursive: true });
  writeFileSync(
    commerceOsLedgerPath,
    `${JSON.stringify({ ...next, updatedAt: nowIso() }, null, 2)}\n`,
    "utf8"
  );
}

export function updateCommerceOsLedger(mutator: (current: CommerceOsLedger) => CommerceOsLedger) {
  const current = readCommerceOsLedger();
  const next = sanitizeLedger(mutator(current));
  writeCommerceOsLedger(next);
  return next;
}

export function recordCommerceAiObservation(observation: CommerceAiObservation) {
  return updateCommerceOsLedger((current) => ({
    ...current,
    aiObservability: [...current.aiObservability, observation]
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .slice(-250),
  }));
}

export function recordCommerceJobExecution(record: CommerceJobExecutionRecord) {
  return updateCommerceOsLedger((current) => {
    const nextRuns = current.jobExecutions.filter((entry) => entry.id !== record.id);
    nextRuns.push(record);
    return {
      ...current,
      jobExecutions: nextRuns.sort((left, right) => left.startedAt.localeCompare(right.startedAt)).slice(-250),
    };
  });
}
