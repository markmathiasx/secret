/**
 * CI/CD Production Gates - 2026 Enterprise Standard
 * Ensures code quality, security, and performance before deployment
 */

export interface GateResult {
  name: string;
  passed: boolean;
  checks: GateCheck[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  blocksDeployment: boolean;
}

export interface GateCheck {
  id: string;
  name: string;
  passed: boolean;
  message?: string;
  metrics?: Record<string, any>;
}

/**
 * Gate 1: Lint & Code Quality
 */
export const lintGate: GateResult = {
  name: 'Code Quality & Lint',
  passed: false,
  severity: 'critical',
  blocksDeployment: true,
  checks: [
    {
      id: 'eslint',
      name: 'ESLint',
      passed: false,
      message: 'Run: npm run lint'
    },
    {
      id: 'prettier',
      name: 'Code Formatting',
      passed: false,
      message: 'Run: npm run format'
    },
    {
      id: 'typescript',
      name: 'TypeScript Compilation',
      passed: false,
      message: 'Run: npm run type-check'
    }
  ]
};

/**
 * Gate 2: Unit Tests
 */
export const unitTestsGate: GateResult = {
  name: 'Unit Tests',
  passed: false,
  severity: 'critical',
  blocksDeployment: true,
  checks: [
    {
      id: 'unit-tests',
      name: 'Unit Test Coverage',
      passed: false,
      message: 'Run: npm run test:unit',
      metrics: {
        minCoverage: 80,
        requiredCoverage: ['statements', 'branches', 'functions', 'lines']
      }
    },
    {
      id: 'test-pass-rate',
      name: 'Test Pass Rate',
      passed: false,
      message: 'All tests must pass',
      metrics: {
        required: '100%'
      }
    }
  ]
};

/**
 * Gate 3: Integration Tests
 */
export const integrationTestsGate: GateResult = {
  name: 'Integration Tests',
  passed: false,
  severity: 'high',
  blocksDeployment: true,
  checks: [
    {
      id: 'e2e-tests',
      name: 'End-to-End Tests',
      passed: false,
      message: 'Run: npm run test:e2e',
      metrics: {
        timeout: 300 // seconds
      }
    },
    {
      id: 'api-tests',
      name: 'API Integration Tests',
      passed: false,
      message: 'Critical API endpoints must pass'
    }
  ]
};

/**
 * Gate 4: Security Scan
 */
export const securityGate: GateResult = {
  name: 'Security Scan',
  passed: false,
  severity: 'critical',
  blocksDeployment: true,
  checks: [
    {
      id: 'dependency-audit',
      name: 'Dependency Vulnerabilities',
      passed: false,
      message: 'Run: npm audit',
      metrics: {
        allowedSeverity: 'none', // No vulnerabilities allowed
        excludeDevDeps: false
      }
    },
    {
      id: 'secret-scan',
      name: 'Secrets Detection',
      passed: false,
      message: 'Scanning for exposed secrets (API keys, tokens, etc)',
      metrics: {
        tools: ['git-secrets', 'gitleaks']
      }
    },
    {
      id: 'sca-scan',
      name: 'SCA - Software Composition Analysis',
      passed: false,
      message: 'Analyzing for license compliance and vulnerable components'
    },
    {
      id: 'sast-scan',
      name: 'SAST - Static Application Security Testing',
      passed: false,
      message: 'Scanning source code for security vulnerabilities',
      metrics: {
        tools: ['Semgrep', 'SonarQube']
      }
    }
  ]
};

/**
 * Gate 5: Performance
 */
export const performanceGate: GateResult = {
  name: 'Performance Benchmarks',
  passed: false,
  severity: 'high',
  blocksDeployment: false, // Warning but doesn't block
  checks: [
    {
      id: 'bundle-size',
      name: 'Bundle Size',
      passed: false,
      message: 'Check bundle size limits',
      metrics: {
        maxMainBundle: '250KB', // gzipped
        maxTotalBundle: '500KB', // gzipped
        tool: 'webpack-bundle-analyzer'
      }
    },
    {
      id: 'lighthouse',
      name: 'Lighthouse Score',
      passed: false,
      message: 'Run: npm run build && npm run lighthouse',
      metrics: {
        minPerformance: 80,
        minAccessibility: 80,
        minBestPractices: 80,
        minSEO: 80
      }
    },
    {
      id: 'load-time',
      name: 'Page Load Time',
      passed: false,
      message: 'Measure first contentful paint (FCP) and largest contentful paint (LCP)',
      metrics: {
        maxFCP: '1.8s',
        maxLCP: '2.5s',
        maxCLS: '0.1'
      }
    }
  ]
};

/**
 * Gate 6: Build Verification
 */
export const buildGate: GateResult = {
  name: 'Build Verification',
  passed: false,
  severity: 'critical',
  blocksDeployment: true,
  checks: [
    {
      id: 'build-success',
      name: 'Build Succeeds',
      passed: false,
      message: 'Run: npm run build'
    },
    {
      id: 'docker-build',
      name: 'Docker Image Builds',
      passed: false,
      message: 'Run: docker build -t mdh-3d-store:latest .',
      metrics: {
        maxBuildTime: 600, // seconds
        imageSize: 'Check image size'
      }
    },
    {
      id: 'build-artifacts',
      name: 'Build Artifacts Integrity',
      passed: false,
      message: 'Verify all required artifacts are generated'
    }
  ]
};

/**
 * Gate 7: Database Migration
 */
export const migrationGate: GateResult = {
  name: 'Database Migrations',
  passed: false,
  severity: 'critical',
  blocksDeployment: true,
  checks: [
    {
      id: 'migration-syntax',
      name: 'Migration Syntax Valid',
      passed: false,
      message: 'Validate Prisma migration files'
    },
    {
      id: 'migration-rollback',
      name: 'Rollback Plan Exists',
      passed: false,
      message: 'Ensure downMigration script is present for critical changes'
    },
    {
      id: 'schema-validation',
      name: 'Schema Validation',
      passed: false,
      message: 'Validate schema.prisma against requirements'
    }
  ]
};

/**
 * Gate 8: Deployment Readiness
 */
export const deploymentGate: GateResult = {
  name: 'Deployment Readiness',
  passed: false,
  severity: 'high',
  blocksDeployment: false, // Warning
  checks: [
    {
      id: 'env-vars',
      name: 'Environment Variables',
      passed: false,
      message: 'Verify all required env vars are documented'
    },
    {
      id: 'infra-config',
      name: 'Infrastructure Configuration',
      passed: false,
      message: 'Review docker-compose.yml and infrastructure-as-code',
      metrics: {
        requiredServices: ['postgres', 'redis', 'nginx']
      }
    },
    {
      id: 'backup-strategy',
      name: 'Backup & Disaster Recovery',
      passed: false,
      message: 'Verify backup strategy and recovery procedures'
    }
  ]
};

/**
 * Gate 9: Documentation
 */
export const documentationGate: GateResult = {
  name: 'Documentation Completeness',
  passed: false,
  severity: 'medium',
  blocksDeployment: false, // Warning
  checks: [
    {
      id: 'readme',
      name: 'README Updated',
      passed: false,
      message: 'Verify README reflects current version'
    },
    {
      id: 'changelog',
      name: 'CHANGELOG Updated',
      passed: false,
      message: 'Document all changes in CHANGELOG.md'
    },
    {
      id: 'api-docs',
      name: 'API Documentation',
      passed: false,
      message: 'Verify API endpoints are documented',
      metrics: {
        tool: 'Swagger/OpenAPI'
      }
    },
    {
      id: 'deployment-guide',
      name: 'Deployment Guide',
      passed: false,
      message: 'Step-by-step deployment instructions exist'
    }
  ]
};

/**
 * Gate 10: Compliance & Legal
 */
export const complianceGate: GateResult = {
  name: 'Compliance & Legal',
  passed: false,
  severity: 'critical',
  blocksDeployment: true,
  checks: [
    {
      id: 'license-compliance',
      name: 'License Compliance',
      passed: false,
      message: 'Verify all dependencies have compatible licenses',
      metrics: {
        allowedLicenses: [
          'MIT',
          'Apache-2.0',
          'GPL-3.0',
          'BSD-3-Clause'
        ]
      }
    },
    {
      id: 'privacy-gdpr',
      name: 'GDPR Compliance',
      passed: false,
      message: 'Verify data handling and privacy controls'
    },
    {
      id: 'pci-dss',
      name: 'PCI-DSS Compliance',
      passed: false,
      message: 'Verify payment processing security'
    }
  ]
};

/**
 * Run all gates and summarize results
 */
export async function runAllGates(): Promise<{
  totalGates: number;
  passedGates: number;
  failedGates: number;
  blockedDeployment: boolean;
  gates: GateResult[];
  summary: string;
}> {
  const allGates = [
    lintGate,
    unitTestsGate,
    integrationTestsGate,
    securityGate,
    performanceGate,
    buildGate,
    migrationGate,
    deploymentGate,
    documentationGate,
    complianceGate
  ];

  const passedGates = allGates.filter(gate => gate.passed).length;
  const failedGates = allGates.filter(gate => !gate.passed).length;
  const blockedDeployment = allGates.some(
    gate => gate.blocksDeployment && !gate.passed
  );

  const summary = blockedDeployment
    ? `❌ DEPLOYMENT BLOCKED: ${failedGates} critical gates failed`
    : `✓ Deployment ready (${passedGates}/${allGates.length} gates passed)`;

  return {
    totalGates: allGates.length,
    passedGates,
    failedGates,
    blockedDeployment,
    gates: allGates,
    summary
  };
}

/**
 * Generate detailed gate report
 */
export function generateGateReport(gates: GateResult[]): string {
  let report = `
═══════════════════════════════════════════════════════════════
  PRODUCTION DEPLOYMENT GATES REPORT
═══════════════════════════════════════════════════════════════\n`;

  const blockedGates = gates.filter(g => !g.passed && g.blocksDeployment);
  const warningGates = gates.filter(g => !g.passed && !g.blocksDeployment);

  if (blockedGates.length > 0) {
    report += `\n❌ CRITICAL FAILURES (Blocks Deployment):\n`;
    blockedGates.forEach(gate => {
      report += `   • ${gate.name}\n`;
      gate.checks.forEach(check => {
        if (!check.passed) {
          report += `     - ${check.name}: ${check.message || 'Failed'}\n`;
        }
      });
    });
  }

  if (warningGates.length > 0) {
    report += `\n⚠️ WARNINGS (Non-blocking):\n`;
    warningGates.forEach(gate => {
      report += `   • ${gate.name}\n`;
      gate.checks.forEach(check => {
        if (!check.passed) {
          report += `     - ${check.name}: ${check.message || 'Warning'}\n`;
        }
      });
    });
  }

  const passedCount = gates.filter(g => g.passed).length;
  report += `\n✓ PASSED GATES: ${passedCount}/${gates.length}\n`;

  report += `\n═══════════════════════════════════════════════════════════════\n`;

  return report;
}
