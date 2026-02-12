import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class MCPClient extends Client {
  private tools: Tool[] = [];

  constructor() {
    super({
      name: "mcp-tp-client",
      version: "1.0.0",
    })
  }

  async initialize() {
    try {
      await this.connect(new StdioClientTransport({
        command: "node",
        args: ["build/src/server/init.js"]
      }))
      console.log('Connected to MCP Code Server');
    } catch (error) {
      console.error("Error connecting to MCP Code Server:", error);
    }
  }

  async setTools() {
    const toolsResponse = await this.listTools();
    this.tools = toolsResponse.tools;
  }

  async getTools() {
    return this.tools;
  }
}
