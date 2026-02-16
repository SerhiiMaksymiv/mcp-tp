import { InteractiveCLI } from "./cli/cli.js";
import { config } from "./config.js";

async function main() {
  const cli = new InteractiveCLI(config)
  await cli.start()
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
