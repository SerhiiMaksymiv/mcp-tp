import { OllamaResponse, Config, ToolFunction, ToolCallResponse, OllamaMessage } from "../types.js";
import { MCPClient } from "../mcp/client.js";
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export class Ollama {
  public mcp: MCPClient

  private model: string
  private url: string
  private generateUrl: string
  private chatUrl: string
  private messages: OllamaMessage[] = [{
    role: "system",
    content: `
      You are a helpful AI assistant specialized in software development, testing, QA activities, automation, and related technical tasks.
      You have access to external MCP tools.

      If the user input represents an executable command, you MUST attempt to execute it using available MCP tools.
      Do not explain the command unless execution fails.
      Execution has priority over explanation.

      Tool Usage Rules:
      - If a tool is required, return ONLY the tool call.
      - After receiving tool results, continue reasoning.
      - Stop calling tools when the user's task is complete.
      - Provide the final answer only when no further tool calls are needed.

      Other, when the user:
      - Asks a technical question - Provide a precise, structured answer.
      - Requests analysis - Use available tools if they improve accuracy.
      - Issues a command - Execute it using the appropriate MCP tool.
      - Provides an actionable instruction - Treat it as a task to complete via tools when applicable.

      Be deterministic, concise, and avoid unnecessary explanations.
      Never invent tool results.
      If no available tool can help, explain clearly.
    `
  }]

  constructor(config: Config) {
    this.mcp = new MCPClient()
    this.model = config.llm.model
    this.url = config.llm.url
    this.generateUrl = this.url + "/api/generate"
    this.chatUrl = this.url + "/api/chat"
  }

  async fetchWithTimeout(url: any, init = {} as any) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 600000) // 10 minutes

    return fetch(url, {
      ...init,
      signal: init.signal || controller.signal
    }).finally(() => clearTimeout(timeoutId))
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

  async chat(ollamaTools: any): Promise<OllamaResponse | null> {
    let data: OllamaResponse | null = null;

    try {
      const response = await this.fetchWithTimeout(this.chatUrl, {
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
          thinking: true,
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

  private async queryOllama(userInput?: string): Promise<OllamaResponse | null> {
    const _tools = this.mcp.tools
    const ollamaTools = this.convertToolsToOllamaFormat(_tools);

    if (userInput) {
      this.messages.push({
        role: "user",
        content: userInput,
      });
    }

    return this.chat(ollamaTools)
  }

  private async callTool(toolFunction: ToolFunction): Promise<ToolCallResponse[]> {
    try {
      const result = await this.mcp.callTool(toolFunction)
      return result.content as ToolCallResponse[] || [{ type: "text", text: "No response from tool" }]
    } catch (error) {
      return [{ type: "error", text: `Error calling tool: ${error}` }]
    }
  }

  private async generateFinalResponse(toolResult: ToolCallResponse[]): Promise<OllamaResponse | null> {
    this.messages.push({
      role: "tool",
      content: toolResult.map((result) => result.text).join("\n"),
    }, {
      role: "system",
      content: `
        Given user's original query and the responses you have provided:
        If you think you have accomplished users query/task and/or have answered users original question - response with 'Done'.
        Else suggest what can be done further to fulfill users query/task.
        `,
    });

    const _tools = this.mcp.tools
    const ollamaTools = this.convertToolsToOllamaFormat(_tools);

    return this.chat(ollamaTools)
  }

  async runAgent(userInput: string): Promise<ToolCallResponse[]> {
    while (true) {
      const response = await this.queryOllama(userInput);
      console.log(`   Query ollama tool: ${JSON.stringify(response, null, 2)}`);

      const message = response?.message;
      if (!message) {
        return [{ type: "done", text: "No response from tool" }]
      }

      this.messages.push(message);

      if (!message.tool_calls || message.tool_calls.length === 0) {
        return [{ type: "done", text: message.content }];
      }

      for (const toolCall of message.tool_calls) {
        const toolFunction = toolCall.function;
        console.log(`   Using tool: ${toolFunction.name}`);
        console.log(`   Arguments: ${JSON.stringify(toolFunction.arguments)}`);

        const result = await this.callTool(toolFunction);
        console.log(`  Tool result: ${JSON.stringify(result)}`);

        this.messages.push({
          role: "tool",
          name: toolFunction.name,
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        });
      }

      userInput = ''
    }
  }

  async query(userInput: string): Promise<string> {
    console.log("Analyzing query...");
    const toolResult = await this.runAgent(userInput);

    if (toolResult[0].type === "done") {
      // Step 3: Generate natural response
      console.log("  Generating final response...");
      const finalResponse = await this.generateFinalResponse(toolResult);
      console.log(`  Final response: ${JSON.stringify(finalResponse, null, 2)}`);
      return finalResponse?.message.content || "No final response";
    } else {
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
