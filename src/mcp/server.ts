import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JSDOM } from "jsdom";

import { TP } from "../tp/tp.js";
import { UserStory } from "../types.js";

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
        description: 'Gets tp card (user story) content by specified id, e.g. 145789',
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
            content: [{
              type: 'text',
              text: `Failed to get user story, id: ${id}\n JSON: ${JSON.stringify(userStory, null, 2)}`
            }],
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

        const dom = new JSDOM(`<html><body><div id="content">${description}</div></body></html>`)
        const descriptionText = dom.window.document.getElementById('content')?.textContent

        return {
          content: [{ type: 'text', text: JSON.stringify(descriptionText) }],
        };
      }
    );

    this.registerTool(
      'add_comment',
      {
        title: 'Adds comment to TP user story',
        description: 'Adds comment to tp card (user story) by specified id, e.g. 145789',
        inputSchema: {
          id: z.string()
            .length(6)
            .describe('TP (or tp) ID (e.g. 145789)'),
          comment: z.string()
            .describe('Comment to add'),
        },
      },
      async ({ id, comment }) => {
        const userStory = await this.tp.addComment<UserStory>(id, comment);
        if (!userStory) return { content: [{ type: 'text', text: "Failed to get user story" }] };

        return {
          content: [{ type: 'text', text: JSON.stringify(userStory.Description) }],
        };
      }
    )
  }
}

