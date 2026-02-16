import readline from "readline";
import { stdin as input, stdout as output } from 'node:process';

import { Ollama } from "../llm/ollama.js";
import { Config } from "../types.js";

export class InteractiveCLI {
  private ollama: Ollama

  constructor(config: Config) {
    this.ollama = new Ollama(config)
  }

  private introMessage(): void {
    console.log("=".repeat(70));
    console.log(`
      Welcome to the MCP + Ollama CLI (TypeScript - with Tool Calling)!
      This CLI allows you to interact with the MCP + Ollama model.
      To get started, please provide a question or command.

      Info:
        - model: ${this.ollama}
    `);
    console.log("=".repeat(70));
  }

  private exampleQueriesMessage(): void {
    console.log(`
      Example queries:
        - write me test cases based on 145322 tp user story
    `);
  }

  async start(): Promise<void> {
    this.introMessage();
    this.exampleQueriesMessage();

    // Initialize MCP client
    await this.ollama.mcp.initialize()

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
          await this.ollama.mcp.close()
          process.exit(0);
        }

        console.log('\n'); // Blank line
        try {
          const response = await this.ollama.query(userInput);
          console.log(`\nAssistant: ${response}`);
        } catch (error) {
          console.error(`\nError: ${error}`);
        }

        promptUser();
      });
    };

    promptUser();
  }
}
