import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JSDOM } from "jsdom";

import { TP } from "../tp/tp.js";
import { UserStoryComment, UserStory } from "../types.js";

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
        description: 'Get tp card (user story) content by specified id, e.g. 145789',
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
            content: [{
              type: "text",
              text: `No description for ${id} tp card`,
            }],
          };
        }

        const dom = new JSDOM(`<html><body><div id="content">${description}</div></body></html>`)
        const descriptionText = dom.window.document.getElementById('content')?.textContent

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(descriptionText)
          }],
        };
      }
    );

    this.registerTool(
      'add_comment',
      {
        title: 'Adds provided content to TP card (user story) as a comment',
        description: `Adds provided content as a comment to the specified tp card by id, e.g. 145789`,
        inputSchema: {
          id: z.string()
            .length(6)
            .describe('TP (or tp) ID (e.g. 145789)'),
          comment: z.string()
            .describe('Comment to add'),
        },
      },
      async ({ id, comment }) => {
        const addCommentResponse = await this.tp.addComment<UserStoryComment>(id, comment);

        if (!addCommentResponse) {
          return {
            content: [{
              type: 'text',
              text: `Failed to add comment to user story, id: ${id}\n JSON: ${JSON.stringify(addCommentResponse, null, 2)}`
            }]
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(addCommentResponse)
          }],
        };
      }
    )
  }
}

