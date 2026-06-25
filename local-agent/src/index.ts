import { getLocalAgentConfig } from "./config.ts";
import { pollOnce } from "./tasks/poller.ts";

const config = getLocalAgentConfig();
const once = process.argv.includes("--once");

async function main() {
  if (!config.sharedSecret) {
    console.error("LOCAL_AGENT_SHARED_SECRET missing. Local agent did not connect to production.");
    process.exitCode = 2;
    return;
  }

  if (once) {
    console.log(JSON.stringify(await pollOnce(config), null, 2));
    return;
  }

  while (true) {
    try {
      console.log(JSON.stringify(await pollOnce(config)));
    } catch (error) {
      console.error(error instanceof Error ? error.message : "local_agent_error");
    }
    await new Promise((resolve) => setTimeout(resolve, config.pollIntervalMs));
  }
}

main();
