# Industrial Baseline

Baseline was captured before industrial code changes under `reports/industrial/baseline/`.

Commands captured:

- `git status --short`
- `git branch --show-current`
- `git log --oneline -20`
- `node -v`
- `npm -v`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npx playwright test`
- `npm run commerce-os:score`
- `node scripts/validate-production-public.ts`
- `npm audit --audit-level=low`

Baseline result:

- Build: PASS.
- Lint: PASS.
- Typecheck: PASS.
- Test: PASS.
- Playwright: PASS.
- Commerce OS score: PASS, `100/100/100`.
- Production public validation: PASS.
- NPM audit: PASS, `0 vulnerabilities`.

Notes:

- Playwright used system Chrome via `PLAYWRIGHT_USE_SYSTEM_CHROME=1`.
- Dummy local session secrets were used only in-process for tests.
