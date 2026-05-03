#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step) {
  log(`\n🔹 ${step}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function runCommand(command, description) {
  logStep(description);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    logSuccess(description);
    return { success: true, output };
  } catch (error) {
    logError(`${description} failed`);
    if (error.stdout) console.log('STDOUT:', error.stdout);
    if (error.stderr) console.log('STDERR:', error.stderr);
    return { success: false, error: error.message };
  }
}

function checkPackageJson() {
  logStep('Checking package.json structure');
  try {
    const packagePath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    
    const requiredScripts = [
      'lint:check',
      'typecheck',
      'build',
      'test:images',
      'test:e2e',
      'ci:check'
    ];
    
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missingScripts.length > 0) {
      logError(`Missing required scripts: ${missingScripts.join(', ')}`);
      return false;
    }
    
    logSuccess('package.json structure valid');
    return true;
  } catch (error) {
    logError(`package.json check failed: ${error.message}`);
    return false;
  }
}

function checkEnvironmentFiles() {
  logStep('Checking environment files');
  const requiredEnvFiles = ['.env.example'];
  
  for (const envFile of requiredEnvFiles) {
    try {
      const envPath = join(process.cwd(), envFile);
      readFileSync(envPath, 'utf8');
      logSuccess(`${envFile} exists`);
    } catch (error) {
      logError(`${envFile} missing`);
      return false;
    }
  }
  
  return true;
}

function checkCriticalFiles() {
  logStep('Checking critical files');
  const criticalFiles = [
    'next.config.ts',
    'middleware.ts',
    'lib/env.ts',
    'lib/sanitize.ts',
    'lib/cache.ts',
    'lib/pricing-engine.ts',
    'lib/analytics.ts',
    'app/sitemap.ts',
    'app/api/health/route.ts',
    'components/hero/ConversionHero.tsx',
  ];
  
  const missingFiles = [];
  
  for (const file of criticalFiles) {
    try {
      const filePath = join(process.cwd(), file);
      readFileSync(filePath, 'utf8');
    } catch (error) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    logError(`Missing critical files: ${missingFiles.join(', ')}`);
    return false;
  }
  
  logSuccess('All critical files present');
  return true;
}

function checkSecurityConfig() {
  logStep('Checking security configuration');
  
  try {
    const nextConfigPath = join(process.cwd(), 'next.config.ts');
    const nextConfig = readFileSync(nextConfigPath, 'utf8');
    
    // Check for security headers
    const securityChecks = [
      { pattern: /Content-Security-Policy/, name: 'CSP' },
      { pattern: /X-Frame-Options.*DENY/, name: 'X-Frame-Options' },
      { pattern: /X-Content-Type-Options.*nosniff/, name: 'X-Content-Type-Options' },
      { pattern: /Strict-Transport-Security/, name: 'HSTS' },
    ];
    
    for (const check of securityChecks) {
      if (!check.pattern.test(nextConfig)) {
        logWarning(`Missing security header: ${check.name}`);
      }
    }
    
    // Check for unoptimized images
    if (nextConfig.includes('unoptimized: true')) {
      logError('Images should not be unoptimized in production');
      return false;
    }
    
    logSuccess('Security configuration checked');
    return true;
  } catch (error) {
    logError(`Security check failed: ${error.message}`);
    return false;
  }
}

function checkPerformanceConfig() {
  logStep('Checking performance configuration');
  
  try {
    const nextConfigPath = join(process.cwd(), 'next.config.ts');
    const nextConfig = readFileSync(nextConfigPath, 'utf8');
    
    const performanceChecks = [
      { pattern: /formats.*\[.*webp.*avif.*\]/, name: 'Image formats (WebP/AVIF)' },
      { pattern: /minimumCacheTTL.*86400/, name: 'Image cache TTL' },
      { pattern: /optimizePackageImports/, name: 'Package optimization' },
    ];
    
    for (const check of performanceChecks) {
      if (!check.pattern.test(nextConfig)) {
        logWarning(`Missing performance optimization: ${check.name}`);
      }
    }
    
    logSuccess('Performance configuration checked');
    return true;
  } catch (error) {
    logError(`Performance check failed: ${error.message}`);
    return false;
  }
}

// Main CI check
async function main() {
  log('\n🚀 MDH 3D Store - CI Pipeline Check', 'bright');
  log('=====================================', 'bright');
  
  const checks = [
    { name: 'Package structure', fn: checkPackageJson },
    { name: 'Environment files', fn: checkEnvironmentFiles },
    { name: 'Critical files', fn: checkCriticalFiles },
    { name: 'Security configuration', fn: checkSecurityConfig },
    { name: 'Performance configuration', fn: checkPerformanceConfig },
  ];
  
  let allPassed = true;
  
  // Run static checks first
  for (const check of checks) {
    if (!check.fn()) {
      allPassed = false;
    }
  }
  
  if (!allPassed) {
    logError('\n❌ Static checks failed. Fix issues before proceeding.');
    process.exit(1);
  }
  
  // Run build and test commands
  const commands = [
    { cmd: 'npm run lint:check', desc: 'Lint check' },
    { cmd: 'npm run typecheck', desc: 'TypeScript check' },
    { cmd: 'npm run build', desc: 'Build check' },
  ];
  
  for (const command of commands) {
    const result = runCommand(command.cmd, command.desc);
    if (!result.success) {
      allPassed = false;
      break;
    }
  }
  
  // Check bundle size
  if (allPassed) {
    logStep('Checking bundle size');
    try {
      const buildOutput = readFileSync(join(process.cwd(), '.next/build-manifest.json'), 'utf8');
      const manifest = JSON.parse(buildOutput);
      
      // Calculate approximate JS bundle size
      let totalJsSize = 0;
      for (const page in manifest.pages) {
        const pageFiles = manifest.pages[page];
        for (const file of pageFiles) {
          if (file.endsWith('.js')) {
            try {
              const filePath = join(process.cwd(), '.next', file);
              const stats = require('fs').statSync(filePath);
              totalJsSize += stats.size;
            } catch {
              // File might not exist or be accessible
            }
          }
        }
      }
      
      const jsSizeKB = Math.round(totalJsSize / 1024);
      log(`Total JS bundle size: ~${jsSizeKB} KB`, jsSizeKB < 100 ? 'green' : 'yellow');
      
      if (jsSizeKB > 100) {
        logWarning('JS bundle size exceeds 100KB target');
      }
    } catch (error) {
      logWarning(`Could not check bundle size: ${error.message}`);
    }
  }
  
  // Final summary
  log('\n📊 CI Check Summary', 'bright');
  log('==================', 'bright');
  
  if (allPassed) {
    logSuccess('✅ All CI checks passed!');
    logSuccess('✅ Ready for deployment');
    log('\nNext steps:', 'cyan');
    log('1. Run: npm run test:images', 'cyan');
    log('2. Run: npm run test:e2e', 'cyan');
    log('3. Commit and push changes', 'cyan');
    process.exit(0);
  } else {
    logError('❌ CI checks failed');
    logError('Fix the issues above and run again');
    process.exit(1);
  }
}

main().catch(error => {
  logError(`CI check failed with error: ${error.message}`);
  process.exit(1);
});
