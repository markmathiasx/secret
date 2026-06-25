# Windows Local Operator Runbook

Start:

```powershell
$env:LOCAL_AGENT_SHARED_SECRET="<same-secret-configured-on-site>"
$env:LOCAL_AGENT_WORKDIR="M:\LOJA\mdh-prod-deploy"
.\scripts\windows\start-local-qwen-agent.ps1
```

Check once:

```powershell
.\scripts\windows\check-local-qwen-agent.ps1
```

Stop:

```powershell
.\scripts\windows\stop-local-qwen-agent.ps1
```

The local agent cannot deploy, cannot push main and cannot execute arbitrary commands.
