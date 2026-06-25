# Local Qwen Operator Report

Implemented files:

- `local-agent/package.json`
- `local-agent/src/**/*`
- `scripts/windows/start-local-qwen-agent.ps1`
- `scripts/windows/check-local-qwen-agent.ps1`
- `scripts/windows/stop-local-qwen-agent.ps1`

Architecture:

- Production never calls `localhost`.
- Vercel exposes a protected pull endpoint.
- The PC pulls jobs with `LOCAL_AGENT_SHARED_SECRET`.
- Ollama is called only by the local agent.
- Deploy, push main, force push and arbitrary commands are blocked.

Validate:

- `npm run ai:health`
- `npm run local-agent:once` when `LOCAL_AGENT_SHARED_SECRET` is configured.
