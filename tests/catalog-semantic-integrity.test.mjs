#!/usr/bin/env node
/**
 * Test Gate: Catalog Semantic Integrity
 *
 * Validates that the semantic audit has been run and that no items
 * classified as BLOCKED are being served with hero-eligible or
 * public-safe media status.
 *
 * Exit codes:
 *   0 — all checks pass
 *   1 — semantic audit not found or integrity violations detected
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AUDIT_PATH = path.join(ROOT, "output/CATALOG_SEMANTIC_AUDIT.json");

let exitCode = 0;
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    exitCode = 1;
    console.error(`  ❌ ${message}`);
  }
}

console.log("\n🧪 Catalog Semantic Integrity Test Gate\n");

// Test 1: Audit file exists
assert(fs.existsSync(AUDIT_PATH), "Semantic audit report exists");

if (!fs.existsSync(AUDIT_PATH)) {
  console.error("\n💥 Cannot proceed without audit report. Run: node scripts/catalog_semantic_audit.mjs\n");
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
const items = audit.items || [];
const stats = audit.stats || {};

// Test 2: All items audited
assert(items.length >= 248, `All snapshot items audited (${items.length} >= 248)`);

// Test 3: Every item has required fields
const hasRequiredFields = items.every(
  (i) => i.id && i.status && i.mediaStatus !== undefined && typeof i.isPlaceholderSet === "boolean"
);
assert(hasRequiredFields, "All items have required audit fields");

// Test 4: No APPROVED item is a placeholder set
const approvedPlaceholders = items.filter((i) => i.status === "APPROVED" && i.isPlaceholderSet);
assert(
  approvedPlaceholders.length === 0,
  `No APPROVED items with placeholder images (found ${approvedPlaceholders.length})`
);

// Test 5: All placeholder sets are BLOCKED
const nonBlockedPlaceholders = items.filter((i) => i.isPlaceholderSet && i.status !== "BLOCKED");
assert(
  nonBlockedPlaceholders.length === 0,
  `All placeholder text cards are BLOCKED (${nonBlockedPlaceholders.length} exceptions)`
);

// Test 6: mdh-057 is specifically BLOCKED (critical case)
const mdh057 = items.find((i) => i.id === "mdh-057");
assert(
  mdh057 && mdh057.status === "BLOCKED" && mdh057.isPlaceholderSet,
  `mdh-057 is BLOCKED with placeholder flag (status: ${mdh057?.status})`
);

// Test 7: All APPROVED items have finalScore >= 0.70
const lowScoreApproved = items.filter((i) => i.status === "APPROVED" && i.finalScore < 0.70);
assert(
  lowScoreApproved.length === 0,
  `All APPROVED items have score >= 0.70 (${lowScoreApproved.length} violations)`
);

// Test 8: Audit timestamp is recent (within 7 days)
const auditDate = new Date(audit.timestamp);
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
assert(auditDate > weekAgo, `Audit is recent (${audit.timestamp})`);

// Test 9: Stats are internally consistent
const sumStatuses = stats.approved + stats.fixImage + stats.fixText + stats.fixBoth + stats.blocked;
assert(
  sumStatuses === stats.total,
  `Status counts sum to total (${sumStatuses} === ${stats.total})`
);

// Test 10: No item has APPROVED status + placeholder mediaStatus
const inconsistent = items.filter(
  (i) => i.status === "APPROVED" && (i.mediaStatus === "placeholder" || i.mediaStatus === "rejected")
);
assert(
  inconsistent.length === 0,
  `No APPROVED items with placeholder/rejected mediaStatus (${inconsistent.length})`
);

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (exitCode !== 0) {
  console.error("⛔ Semantic integrity check FAILED\n");
}

process.exit(exitCode);
