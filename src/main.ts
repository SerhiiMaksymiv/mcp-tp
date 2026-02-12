import { InteractiveCLI } from "./cli/cli.js";
import { MCPClient } from "./client/client.js";
import { TP } from "./tp/tp.js";
import { UserStory } from "./types/tp.user.story.js";

async function main() {
  const tp = new TP()
  const userStory = await tp.getUserStory<UserStory>("145072")
  console.log(JSON.stringify(userStory.Description, null, 2))
  const client = new MCPClient()
  const cli = new InteractiveCLI(client)
  await cli.start()
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
