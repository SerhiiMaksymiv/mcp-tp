#!/usr/bin/env node
/**
 * MCP Server with placeholder tools
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Create MCP server
const server = new McpServer(
  {
    name: "example-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define placeholder tools
const tools: Tool[] = [
  {
    name: "get_weather",
    description: "Get the current weather for a specified location",
    inputSchema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "City name or location",
        },
      },
      required: ["location"],
    },
  },
  {
    name: "calculate",
    description: "Perform basic mathematical calculations",
    inputSchema: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "Mathematical expression to evaluate",
        },
      },
      required: ["expression"],
    },
  },
  {
    name: "search_web",
    description: "Search the web for information",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_time",
    description: "Get the current time in a specified timezone",
    inputSchema: {
      type: "object",
      properties: {
        timezone: {
          type: "string",
          description: "Timezone (e.g., 'UTC', 'America/New_York')",
        },
      },
      required: ["timezone"],
    },
  },
];

// Handle tool listing
server.server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "get_weather": {
      const location = (args as { location: string }).location;
      return {
        content: [
          {
            type: "text",
            text: `[Placeholder] Weather in ${location}: Sunny, 72°F`,
          },
        ],
      };
    }

    case "calculate": {
      const expression = (args as { expression: string }).expression;
      return {
        content: [
          {
            type: "text",
            text: `[Placeholder] Result of '${expression}': 42`,
          },
        ],
      };
    }

    case "search_web": {
      const query = (args as { query: string }).query;
      return {
        content: [
          {
            type: "text",
            text: `[Placeholder] Search results for '${query}': Found 10 results`,
          },
        ],
      };
    }

    case "get_time": {
      const timezone = (args as { timezone: string }).timezone;
      return {
        content: [
          {
            type: "text",
            text: `[Placeholder] Current time in ${timezone}: 12:00 PM`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
