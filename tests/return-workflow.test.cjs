const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

const filename = resolve(__dirname, '..', 'lib/return-workflow.ts');
const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: filename,
}).outputText;
const loaded = { exports: {} };
new Function('require', 'module', 'exports', compiled)(require, loaded, loaded.exports);
const workflow = loaded.exports;

test('accepts only declared statuses', () => {
  assert.equal(workflow.isReturnStatus('REQUESTED'), true);
  assert.equal(workflow.isReturnStatus('UNKNOWN'), false);
});

test('enforces return lifecycle transitions', () => {
  assert.doesNotThrow(() => workflow.assertReturnTransition('REQUESTED', 'UNDER_REVIEW'));
  assert.doesNotThrow(() => workflow.assertReturnTransition('REFUNDED', 'REFUNDED'));
  assert.throws(() => workflow.assertReturnTransition('REQUESTED', 'REFUNDED'));
  assert.throws(() => workflow.assertReturnTransition('REFUNDED', 'REQUESTED'));
});
