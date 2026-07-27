import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AUDIT_PATH = path.join(ROOT, "output/CATALOG_SEMANTIC_AUDIT.json");
const SNAPSHOT_PATH = path.join(ROOT, "data/local-catalog-image-snapshot.json");

test("Catalog Semantic Integrity Test Gate", async () => {
  console.log("\n🧪 Catalog Semantic Integrity Test Gate\n");

  expect(fs.existsSync(AUDIT_PATH), "Semantic audit report exists").toBe(true);
  expect(fs.existsSync(SNAPSHOT_PATH), "Catalog image snapshot exists").toBe(true);

  const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));
  const items = audit.items || [];
  const stats = audit.stats || {};

  expect(items.length, `All snapshot items audited (${items.length} === ${snapshot.length})`).toBe(snapshot.length);
  expect(stats.total, `Stats total matches snapshot (${stats.total} === ${snapshot.length})`).toBe(snapshot.length);

  const auditedIds = new Set(items.map((item) => item.id));
  const missingIds = snapshot.filter((item) => !auditedIds.has(item.id)).map((item) => item.id);
  expect(missingIds, `No snapshot IDs missing from audit (${missingIds.join(", ")})`).toEqual([]);

  const hasRequiredFields = items.every(
    (item) =>
      item.id &&
      item.status &&
      item.mediaStatus !== undefined &&
      typeof item.isPlaceholderSet === "boolean"
  );
  expect(hasRequiredFields, "All items have required audit fields").toBe(true);

  const approvedPlaceholders = items.filter((item) => item.status === "APPROVED" && item.isPlaceholderSet);
  expect(
    approvedPlaceholders.length,
    `No APPROVED items with placeholder images (found ${approvedPlaceholders.length})`
  ).toBe(0);

  const nonBlockedPlaceholders = items.filter((item) => item.isPlaceholderSet && item.status !== "BLOCKED");
  expect(
    nonBlockedPlaceholders.length,
    `All placeholder text cards are BLOCKED (${nonBlockedPlaceholders.length} exceptions)`
  ).toBe(0);

  const mdh057 = items.find((item) => item.id === "mdh-057");
  expect(
    Boolean(mdh057 && mdh057.status === "BLOCKED" && mdh057.isPlaceholderSet),
    `mdh-057 is BLOCKED with placeholder flag (status: ${mdh057?.status})`
  ).toBe(true);

  const lowScoreApproved = items.filter((item) => item.status === "APPROVED" && item.finalScore < 0.7);
  expect(
    lowScoreApproved.length,
    `All APPROVED items have score >= 0.70 (${lowScoreApproved.length} violations)`
  ).toBe(0);

  const auditDate = new Date(audit.timestamp);
  expect(Number.isNaN(auditDate.getTime()), `Audit timestamp is parseable (${audit.timestamp})`).toBe(false);

  const sumStatuses = stats.approved + stats.fixImage + stats.fixText + stats.fixBoth + stats.blocked;
  expect(sumStatuses, `Status counts sum to total (${sumStatuses} === ${stats.total})`).toBe(stats.total);

  const inconsistent = items.filter(
    (item) =>
      item.status === "APPROVED" &&
      (item.mediaStatus === "placeholder" || item.mediaStatus === "rejected")
  );
  expect(
    inconsistent.length,
    `No APPROVED items with placeholder/rejected mediaStatus (${inconsistent.length})`
  ).toBe(0);
});
