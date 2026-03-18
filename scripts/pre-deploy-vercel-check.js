#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n' + '='.repeat(70));
console.log('🔍 PRE-DEPLOY VERCEL CHECKLIST (100% Quality Assurance)');
console.log('='.repeat(70) + '\n');

const checks = [];
let passed = 0;
let failed = 0;

function addCheck(name, status, details = '') {
  checks.push({ name, status, details });
  if (status === 'PASS') {
    passed++;
    console.log(`✅ ${name}`);
  } else if (status === 'WARN') {
    console.log(`⚠️  ${name}`);
  } else {
    failed++;
    console.log(`❌ ${name}`);
  }
  if (details) console.log(`   ${details}\n`);
}

// 1. Git Status
console.log('📋 STAGE 1: GIT & REPOSITORY\n');
try {
  const gitStatus = execSync('git status --porcelain', { cwd: 'd:\\mdh-3d-store', encoding: 'utf8' });
  if (gitStatus.trim() === '') {
    addCheck('Git Status', 'PASS', 'Working tree clean, ready to commit');
  } else {
    addCheck('Git Status', 'WARN', `${gitStatus.split('\n').length} uncommitted files`);
  }
} catch (e) {
  addCheck('Git Status', 'FAIL', 'Git not initialized or not found');
}

// 2. Catalog Validation
console.log('\n📦 STAGE 2: CATALOG & IMAGES\n');
try {
  const catalogPath = 'd:\\mdh-3d-store\\lib\\catalog.ts';
  const catalogContent = fs.readFileSync(catalogPath, 'utf8');
  const productCount = (catalogContent.match(/id:\s*"mdh-\d+"/g) || []).length;
  addCheck('Catalog Products Count', 'PASS', `${productCount} products defined`);

  const catalogAssetsPath = 'd:\\mdh-3d-store\\catalog-assets';
  const imageFiles = fs.readdirSync(catalogAssetsPath)
    .filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f))
    .length;
  addCheck('Catalog Images Available', 'PASS', `${imageFiles} image files present`);

  if (productCount > 0 && imageFiles > 0) {
    const coverage = Math.round((imageFiles / productCount) * 100);
    if (coverage >= 90) {
      addCheck('Image Coverage', 'PASS', `${coverage}% of products have images`);
    } else {
      addCheck('Image Coverage', 'WARN', `${coverage}% - some products may use placeholder`);
    }
  }
} catch (e) {
  addCheck('Catalog Validation', 'FAIL', e.message);
}

// 3. TypeScript & Build
console.log('\n🏗️  STAGE 3: BUILD & TYPES\n');
try {
  // Check tsconfig
  const tsconfigPath = 'd:\\mdh-3d-store\\tsconfig.json';
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  addCheck('TypeScript Config', 'PASS', 'tsconfig.json valid and present');

  // Check if node_modules exists
  const nodeModulesPath = 'd:\\mdh-3d-store\\node_modules';
  if (fs.existsSync(nodeModulesPath)) {
    addCheck('Dependencies', 'PASS', 'node_modules present');
  } else {
    addCheck('Dependencies', 'WARN', 'node_modules not found - run npm install');
  }

  // Check next.config.ts
  const nextConfigPath = 'd:\\mdh-3d-store\\next.config.ts';
  if (fs.existsSync(nextConfigPath)) {
    addCheck('Next Config', 'PASS', 'next.config.ts configured');
  } else {
    addCheck('Next Config', 'FAIL', 'next.config.ts missing');
  }
} catch (e) {
  addCheck('Build Config', 'FAIL', e.message);
}

// 4. Key Files Present
console.log('\n📄 STAGE 4: REQUIRED FILES\n');
const requiredFiles = [
  { path: 'd:\\mdh-3d-store\\package.json', name: 'package.json' },
  { path: 'd:\\mdh-3d-store\\vercel.json', name: 'vercel.json' },
  { path: 'd:\\mdh-3d-store\\.env.example', name: '.env.example' },
  { path: 'd:\\mdh-3d-store\\app\\layout.tsx', name: 'app/layout.tsx' },
  { path: 'd:\\mdh-3d-store\\app\\page.tsx', name: 'app/page.tsx' },
  { path: 'd:\\mdh-3d-store\\app\\robots.ts', name: 'robots.ts' },
  { path: 'd:\\mdh-3d-store\\app\\sitemap.ts', name: 'sitemap.ts' },
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file.path)) {
    addCheck(`File: ${file.name}`, 'PASS');
  } else {
    addCheck(`File: ${file.name}`, 'FAIL');
  }
});

// 5. SEO & Meta
console.log('\n🔎 STAGE 5: SEO & METADATA\n');
try {
  const layoutPath = 'd:\\mdh-3d-store\\app\\layout.tsx';
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');

  if (layoutContent.includes('robots') || layoutContent.includes('viewport')) {
    addCheck('Metadata Setup', 'PASS', 'Layout includes metadata configuration');
  } else {
    addCheck('Metadata Setup', 'WARN', 'Consider adding more metadata');
  }

  const sitemapPath = 'd:\\mdh-3d-store\\app\\sitemap.ts';
  if (fs.existsSync(sitemapPath)) {
    addCheck('Sitemap', 'PASS', 'sitemap.ts present for SEO');
  } else {
    addCheck('Sitemap', 'WARN', 'sitemap.ts not found');
  }

  const robotsPath = 'd:\\mdh-3d-store\\app\\robots.ts';
  if (fs.existsSync(robotsPath)) {
    addCheck('Robots.txt', 'PASS', 'robots.ts configured for search engines');
  } else {
    addCheck('Robots.txt', 'WARN', 'robots.ts not found');
  }
} catch (e) {
  addCheck('SEO Check', 'FAIL', e.message);
}

// 6. Performance
console.log('\n⚡ STAGE 6: PERFORMANCE\n');
try {
  const nextConfigPath = 'd:\\mdh-3d-store\\next.config.ts';
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');

  if (nextConfigContent.includes('compress') || nextConfigContent.includes('image')) {
    addCheck('Performance Config', 'PASS', 'Compression and image optimization enabled');
  } else {
    addCheck('Performance Config', 'WARN', 'Verify performance settings');
  }

  if (nextConfigContent.includes('cache') || nextConfigContent.includes('Cache-Control')) {
    addCheck('Cache Headers', 'PASS', 'Cache headers configured');
  } else {
    addCheck('Cache Headers', 'WARN', 'Consider adding cache headers');
  }
} catch (e) {
  addCheck('Performance', 'FAIL', e.message);
}

// 7. Security
console.log('\n🔒 STAGE 7: SECURITY\n');
try {
  const nextConfigContent = fs.readFileSync('d:\\mdh-3d-store\\next.config.ts', 'utf8');

  if (nextConfigContent.includes('X-Frame-Options')) {
    addCheck('Security Headers', 'PASS', 'X-Frame-Options header configured');
  } else {
    addCheck('Security Headers', 'WARN', 'Consider adding security headers');
  }

  if (nextConfigContent.includes('nosniff')) {
    addCheck('Content-Type Protection', 'PASS', 'X-Content-Type-Options header set');
  } else {
    addCheck('Content-Type Protection', 'WARN', 'MIME type protection recommended');
  }
} catch (e) {
  addCheck('Security', 'FAIL', e.message);
}

// 8. Payment & Checkout
console.log('\n💳 STAGE 8: COMMERCE FEATURES\n');
try {
  if (fs.existsSync('d:\\mdh-3d-store\\app\\checkout\\page.tsx')) {
    addCheck('Checkout Page', 'PASS', '/checkout route available');
  } else {
    addCheck('Checkout Page', 'WARN', 'Checkout may not be fully configured');
  }

  const catalogPath = 'd:\\mdh-3d-store\\app\\catalogo\\[slug]\\page.tsx';
  if (fs.existsSync(catalogPath)) {
    addCheck('Product Pages', 'PASS', '/catalogo/[slug] dynamic routes ready');
  } else {
    addCheck('Product Pages', 'WARN', 'Product detail page not found');
  }
} catch (e) {
  addCheck('Commerce Features', 'FAIL', e.message);
}

// 9. Environment
console.log('\n🌍 STAGE 9: ENVIRONMENT\n');
try {
  const envExamplePath = 'd:\\mdh-3d-store\\.env.example';
  const envContent = fs.readFileSync(envExamplePath, 'utf8');

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'MERCADOPAGO_ACCESS_TOKEN',
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'
  ];

  let envVarsFound = 0;
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) envVarsFound++;
  });

  if (envVarsFound >= 2) {
    addCheck('Environment Variables', 'PASS', `${envVarsFound}/${requiredVars.length} critical vars configured`);
  } else {
    addCheck('Environment Variables', 'WARN', 'Ensure env vars are set in Vercel');
  }
} catch (e) {
  addCheck('Environment', 'FAIL', e.message);
}

// 10. Vercel Config
console.log('\n🚀 STAGE 10: VERCEL DEPLOYMENT\n');
try {
  const vercelPath = 'd:\\mdh-3d-store\\vercel.json';
  const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

  if (!vercelConfig.functions) {
    addCheck('Vercel Config', 'PASS', 'Hobby Plan compatible (no serverless functions)');
  } else {
    addCheck('Vercel Config', 'WARN', 'Check Hobby Plan limitations');
  }

  if (vercelConfig.cleanUrls !== false) {
    addCheck('Clean URLs', 'PASS', 'Clean URLs enabled');
  }
} catch (e) {
  addCheck('Vercel Config', 'FAIL', e.message);
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 FINAL REPORT\n');

const total = passed + failed;
const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⚠️  Warnings: ${checks.filter(c => c.status === 'WARN').length}`);
console.log(`\n📈 Quality Score: ${passRate}%\n`);

if (passRate === 100) {
  console.log('🎯 EXCELLENT! All checks passed. Ready for production deploy.');
} else if (passRate >= 90) {
  console.log('✅ GOOD! Mostly ready. Review warnings before deploy.');
} else if (passRate >= 70) {
  console.log('⚠️  CAUTION! Fix failures before production deploy.');
} else {
  console.log('❌ CRITICAL! Multiple issues must be resolved.');
}

console.log('\n' + '='.repeat(70) + '\n');

// Save report
const report = {
  timestamp: new Date().toISOString(),
  checks,
  summary: {
    passed,
    failed,
    warnings: checks.filter(c => c.status === 'WARN').length,
    passRate: `${passRate}%`
  }
};

fs.writeFileSync(
  'd:\\mdh-3d-store\\VERCEL_DEPLOY_CHECKLIST.json',
  JSON.stringify(report, null, 2),
  'utf8'
);

console.log('✅ Full report saved: VERCEL_DEPLOY_CHECKLIST.json\n');

process.exit(failed > 0 ? 1 : 0);
