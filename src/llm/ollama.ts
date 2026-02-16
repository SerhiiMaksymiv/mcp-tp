import { OllamaResponse, Config, ToolFunction, ToolCallResponse } from "../types.js";
import { MCPClient } from "../mcp/client.js";
import { PromptMessage, Tool } from '@modelcontextprotocol/sdk/types.js';

export class Ollama {
  public mcp: MCPClient
  private model: string
  private url: string
  private generateUrl: string
  private chatUrl: string
  private messages: any[] = [{
    role: "system",
    content: `You are a helpful assistant with access to tools. When the user asks about available tools or wants to list tools, provide a clear list of available tools with their descriptions.`
  }]

  constructor(config: Config) {
    this.mcp = new MCPClient()
    this.model = config.llm.model
    this.url = config.llm.url
    this.generateUrl = this.url + "/api/generate"
    this.chatUrl = this.url + "/api/chat"
  }

  async generate(prompt: string): Promise<OllamaResponse> {
    const response = await fetch(this.generateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
        temperature: 0.3,
        think: false
      }),
    });

    const data = (await response.json()) as OllamaResponse;
    return data;
  }

  async chat(messages: PromptMessage[], tools: Tool[]): Promise<OllamaResponse> {
    const response = await fetch(this.chatUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        stream: false,
        temperature: 0.3,
        think: false,
        tools
      }),
    });

    const data = (await response.json()) as OllamaResponse;
    return data;
  }

  private convertToolsToOllamaFormat(tools: Tool[]) {
    return tools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));
  }

  private async queryOllamaForToolSelection(userInput: string): Promise<OllamaResponse | null> {
    const _tools = this.mcp.tools
    const ollamaTools = this.convertToolsToOllamaFormat(_tools);
    this.messages.push({
      role: "user",
      content: userInput,
    });

    let data: OllamaResponse | null = null;

    try {
      const response = await fetch(this.chatUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: this.model,
          stream: false,
          temperature: 0.3,
          tools: ollamaTools,
          messages: this.messages,
        }),
      });

      data = (await response.json()) as OllamaResponse;
      return data
    } catch (error) {
      console.error("Error making Ollama request:", error);
      console.error("Request URL:", this.chatUrl);
      return null;
    }
  }

  private async callTool(toolFunction: ToolFunction): Promise<ToolCallResponse[]> {
    try {
      const result = await this.mcp.callTool(toolFunction);
      return result.content as ToolCallResponse[] || [{ type: "text", text: "No response from tool" }]
    } catch (error) {
      return [{ type: "error", text: `Error calling tool: ${error}` }]
    }
  }

  private async generateFinalResponse(toolResult: ToolCallResponse[]): Promise<OllamaResponse | null> {
    this.messages.push({
      role: "tool",
      content: toolResult.map((result) => result.text).join("\n"),
    });

    const _tools = this.mcp.tools
    const ollamaTools = this.convertToolsToOllamaFormat(_tools);

    let data: OllamaResponse | null = null;

    try {
      const response = await fetch(this.chatUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: this.model,
          stream: false,
          temperature: 0.3,
          tools: ollamaTools,
          messages: this.messages,
        }),
      });

      data = (await response.json()) as OllamaResponse;
      return data
    } catch (error) {
      console.error("Error making Ollama request:", error);
      console.error("Request URL:", this.chatUrl);
      return null;
    }
  }

  async query(userInput: string): Promise<string> {
    console.log("Analyzing query...");
    const toolDecision = await this.queryOllamaForToolSelection(userInput);
    console.log(`   Using tool: ${JSON.stringify(toolDecision, null, 2)}`);

    const toolCalls = toolDecision?.message.tool_calls

    if (toolCalls && toolCalls.length > 0) {
      console.log(`   Using tool: ${toolCalls[0].function.name}`);
      console.log(`   Arguments: ${JSON.stringify(toolCalls[0].function.arguments)}`);

      const toolResult = await this.callTool(toolCalls[0].function);
      console.log(`  Tool result: ${JSON.stringify(toolResult)}`);

      // Step 3: Generate natural response
      console.log("  Generating response...");
      const finalResponse = await this.generateFinalResponse(toolResult);
      return finalResponse?.message.content || "No final response";
    } else {
      // No tool needed, just respond
      console.log("  No tool needed, responding directly...");
      const prompt = `User: ${userInput}\n\nAssistant:`;

      try {
        const response = await this.generate(prompt);
        return response.message.content || "";
      } catch {
        return "";
      }
    }
  }
}
