import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TP } from "../tp/tp.js";
import { z } from "zod";
import { UserStory } from "../types/tp.user.story.js";

export class MCPServer extends McpServer {
  private tp: TP

  constructor() {
    super({
      name: "mcp-tp-server",
      version: "1.0.0",
    },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    this.tp = new TP()
  }

  registerTools() {
    this.registerTool(
      'get_user_story',
      {
        title: 'Get TP user story content',
        description: 'Gets tp user story content by specified TP card\'s ID',
        inputSchema: {
          id: z.string()
            .length(6)
            .describe('TP (or tp) ID (e.g. 145789)')
        },
      },
      async ({ id }) => {
        const userStory = await this.tp.getUserStory<UserStory>(id)

        if (!userStory) {
          return {
            content: [{ type: 'text', text: "Failed to get user story" }],
          }
        }
        const description = userStory.Description || '';
        if (!description) {
          return {
            content: [
              {
                type: "text",
                text: `No description for ${id} tp card`,
              },
            ],
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(description) }],
        };
      }
    );
  }
}

