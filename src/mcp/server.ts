import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JSDOM } from "jsdom";

import { TP } from "../tp/tp.js";
import { UserStoryComment, UserStory, Bug } from "../types.js";

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
      'get_user_story_content',
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
      'get_bug_content',
      {
        title: 'Get TP bug content',
        description: 'Get tp card (bug) content by specified id, e.g. 145789',
        inputSchema: {
          id: z.string()
            .length(6)
            .describe('Bug card ID (e.g. 145789)')
        },
      },
      async ({ id }) => {
        const bug = await this.tp.getBug<Bug>(id)

        if (!bug) {
          return {
            content: [{
              type: 'text',
              text: `Failed to get bug, id: ${id}\n JSON: ${JSON.stringify(bug, null, 2)}`
            }],
          }
        }
        const description = bug.Description || '';
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
            .describe('TP card id, usually user story or bug ID (e.g. 145789)'),
          comment: z.string()
            .describe('Comment content to add'),
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

    this.registerTool(
      'create_bug',
      {
        title: 'Create a new bug card',
        description: `Create a new bug card with provided title that summarizes the problem in concise, descriptive manner answering questions What? Where? When?, and content explaining what happened in detail`,
        inputSchema: {
          title: z.string()
            .describe('Bug card title that summarizes the problem in concise, descriptive, and actionable manner, enabling a developer to understand the issue without opening the report'),
          bugContent: z.string()
            .describe('Comment content to add, explain what happened in detail. Include expected behaviour and what actually occurred. Be specific and avoid assumptions. Clearly outline the actions needed to trigger the bug. Number each step so anyone can follow them easily'),
        },
      },
      async ({ title, bugContent }) => {
        const bugResponse = await this.tp.creteBug<Bug>(title, bugContent);

        if (!bugResponse) {
          return {
            content: [{
              type: 'text',
              text: `Failed to create comment "${title}"\n JSON: ${JSON.stringify(bugResponse, null, 2)}`
            }]
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(bugResponse)
          }],
        };
      }
    )
  }
}

