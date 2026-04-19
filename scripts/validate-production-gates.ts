/**
 * Production Gates Runner - Execute all validation gates
 */

import { runAllGates, generateGateReport } from './lib/production-gates';
import { validateFullCatalog } from './lib/catalog-validation';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

async function main() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════════════╗
║         PRODUCTION DEPLOYMENT GATES VALIDATION                ║
║              MDH 3D Store - 2026 Enterprise Edition           ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    console.log(`${colors.blue}▶ Running Production Gates...${colors.reset}`);
    const gatesResult = await runAllGates();

    console.log(generateGateReport(gatesResult.gates));

    if (gatesResult.blockedDeployment) {
      console.log(`${colors.red}
╔═════════════════════════════════════════════════════════════╗
║                  DEPLOYMENT BLOCKED                         ║
║  Fix the critical failures above before deploying to prod   ║
╚═════════════════════════════════════════════════════════════╝
${colors.reset}`);
      process.exit(1);
    }

    // Optional: Validate catalog if requested
    if (process.argv.includes('--validate-catalog')) {
      console.log(`${colors.blue}▶ Validating Product Catalog (this may take a while)...${colors.reset}`);

      const catalogResult = await validateFullCatalog((current, total, productId) => {
        const percent = Math.round((current / total) * 100);
        process.stdout.write(
          `\r  Progress: ${current}/${total} (${percent}%) - Current: ${productId}`
        );
      });

      console.log();
      console.log(`${colors.green}
✓ Catalog Validation Complete:
  - Total Products: ${catalogResult.totalProducts}
  - Valid: ${colors.green}${catalogResult.validCount}${colors.reset}
  - Invalid: ${catalogResult.invalidCount > 0 ? colors.red : colors.green}${catalogResult.invalidCount}${colors.reset}
  - Warnings: ${catalogResult.warningCount > 0 ? colors.yellow : colors.green}${catalogResult.warningCount}${colors.reset}
${colors.reset}`);

      if (catalogResult.invalidCount > 0) {
        console.log(`${colors.yellow}⚠ Found ${catalogResult.invalidCount} invalid products${colors.reset}`);
        const invalidReports = catalogResult.reports.filter(r => r.status === 'INVALID');
        invalidReports.slice(0, 5).forEach(report => {
          console.log(`  • ${report.productId}`);
        });
        if (invalidReports.length > 5) {
          console.log(`  ... and ${invalidReports.length - 5} more`);
        }
      }
    }

    console.log(`${colors.green}
╔═════════════════════════════════════════════════════════════╗
║               READY FOR DEPLOYMENT                          ║
║     All critical gates passed. Safe to deploy to prod       ║
╚═════════════════════════════════════════════════════════════╝
${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Error running gates:${colors.reset}`, error);
    process.exit(1);
  }
}

main();
