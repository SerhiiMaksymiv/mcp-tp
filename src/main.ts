import { InteractiveCLI } from "./cli/cli.js";
import { MCPClient } from "./client/client.js";

async function main() {
  const client = new MCPClient()
  const cli = new InteractiveCLI(client)
  await cli.start()
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
