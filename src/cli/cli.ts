import readline from "readline";
import { stdin as input, stdout as output } from 'node:process';
import { MCPClient } from "../client/client.js";
import { Ollama } from "../llm/ollama.js";

export class InteractiveCLI {
  private model: Ollama

  constructor(client: MCPClient) {
    this.model = new Ollama(client)
  }

  async start(): Promise<void> {
    console.log("=".repeat(70));
    console.log("Advanced MCP + Ollama CLI (TypeScript - with Tool Calling)");
    console.log("=".repeat(70));
    console.log(`Model: ${this.model}`);
    console.log("\nExample queries:");
    console.log("  - What's the weather in Paris?");
    console.log("  - Calculate 25 * 48");
    console.log("  - Search for Python tutorials");
    console.log("  - What time is it in Tokyo?");
    console.log("  - List available tools\n");

    // Initialize MCP client
    await this.model.mcpClient.initialize()

    // Create readline interface
    const rl = readline.createInterface({ input, output });

    // CLI loop
    const promptUser = () => {
      rl.question("\nYou: ", async (userInput) => {
        userInput = userInput.trim();

        if (!userInput) {
          promptUser();
          return;
        }

        if (["quit", "exit", "q"].includes(userInput.toLowerCase())) {
          console.log("\nGoodbye!");
          rl.close();
          await this.model.mcpClient.close()
          process.exit(0);
        }

        console.log(); // Blank line
        try {
          const response = await this.model.query(userInput);
          console.log(`\nAssistant: ${response}`);
        } catch (error) {
          console.log(`\nError: ${error}`);
        }

        promptUser();
      });
    };

    promptUser();
  }
}
