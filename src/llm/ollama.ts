import { OllamaResponse, ToolDecision } from "../types.js";
import { MCPClient } from "..//client/client.js";

export class Ollama {
  private ollamaModel: string;
  private ollamaUrl: string;
  private client: MCPClient

  constructor(client: MCPClient, ollamaModel: string = "my_qwen") {
    this.client = client
    this.ollamaModel = ollamaModel;
    this.ollamaUrl = "http://localhost:11434/api/generate";
  }

  get mcpClient(): MCPClient {
    return this.client
  }

  private async queryOllamaForToolSelection(userInput: string): Promise<ToolDecision> {
    const _tools = await this.client.listTools();
    const toolsJson = _tools.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    }));

    const prompt = `You are a helpful assistant with access to these tools:
      ${JSON.stringify(toolsJson, null, 2)}

      Based on the user's query, determine which tool to call (if any) and what arguments to pass.

      User query: ${userInput}

      Respond with ONLY a JSON object in this exact format:
      {"tool": "tool_name", "arguments": {"param": "value"}}

      If no tool is needed, respond with:
      {"tool": null, "arguments": null}

      JSON response:`

    try {
      const response = await fetch(this.ollamaUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.ollamaModel,
          prompt: prompt,
          stream: false,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        return { tool: null, arguments: null };
      }

      const data = (await response.json()) as OllamaResponse;
      const responseText = data.response || "{}";
      console.log('_responseText', responseText)

      // Extract JSON from response
      const responseWithoutThink = responseText.split('</think>')[1].replace(/(\r\n|\n|\r)/gm, "")
      if (responseWithoutThink) {
        try {
          return JSON.parse(responseWithoutThink);
        } catch {
          console.log('error parsing json')
          return { tool: null, arguments: null };
        }
      }

      console.log('error somewhere here')
      return { tool: null, arguments: null };
    } catch {
      console.log('catch error parsing json')
      return { tool: null, arguments: null };
    }
  }

  private async callTool(toolName: string, args: Record<string, any>): Promise<any> {
    try {
      const result = await this.client.callTool({
        name: toolName,
        arguments: args,
      });

      if (result.content) {
        return result.content || "No response from tool";
      }
      return "No response from tool";
    } catch (error) {
      return `Error calling tool: ${error}`;
    }
  }

  private async generateFinalResponse(userInput: string, toolResult: string): Promise<string> {
    const prompt = `User asked: ${userInput}
      Tool returned: ${toolResult}
      Provide a helpful, natural response to the user based on this information. Keep it concise.`;

    try {
      const response = await fetch(this.ollamaUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.ollamaModel,
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        return "";
      }

      const data = (await response.json()) as OllamaResponse;
      return data.response || "";
    } catch {
      return "";
    }
  }

  async query(userInput: string): Promise<string> {
    // Step 1: Determine if we need a tool
    console.log("  🔍 Analyzing query...");
    const toolDecision = await this.queryOllamaForToolSelection(userInput);

    console.log('_toolDecision', toolDecision)

    const toolName = toolDecision.tool;
    const args = toolDecision.arguments;

    if (toolName && args) {
      console.log(`  🔧 Using tool: ${toolName}`);
      console.log(`     Arguments: ${JSON.stringify(args)}`);

      // Step 2: Call the tool via MCP
      const toolResult = await this.callTool(toolName, args);
      console.log(`  📦 Tool result: ${JSON.stringify(toolResult)}`);

      // Step 3: Generate natural response
      console.log("  💭 Generating response...");
      return await this.generateFinalResponse(userInput, toolResult);
    } else {
      // No tool needed, just respond
      console.log("  💬 No tool needed, responding directly...");
      const prompt = `User: ${userInput}\n\nAssistant:`;

      try {
        const response = await fetch(this.ollamaUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.ollamaModel,
            prompt: prompt,
            stream: false,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as OllamaResponse;
          return data.response || "";
        }
        return "";
      } catch {
        return "";
      }
    }
  }
}
