import { Bug, UserStory, UserStoryComment } from "../types.js";
import { config } from "../config.js";
import { TpClient } from "../tp/client.js";

export class TP {
  private client: TpClient

  constructor() {
    this.client = new TpClient(config)
  }

  async getUserStory<T>(userStoryId: string): Promise<T> {
    const response = await this.client.get<UserStory>({
      pathParam: {
        "userStories": userStoryId,
      },
      param: {
        "format": "json",
      }
    }) as T

    console.log("TP response:", JSON.stringify(response, null, 2));
    return response
  }

  async getBug<T>(bugId: string): Promise<T> {
    const response = await this.client.get<Bug>({
      pathParam: { "bugs": bugId },
      param: { "format": "json" }
    }) as T

    console.log("TP response:", JSON.stringify(response, null, 2));
    return response
  }

  async creteBug<T>(title: string, bugContent: string): Promise<T> {
    const bug = {
      "Name": title,
      "Project": { 
        "Id": 59901 
      },
      "customFields": [ { 
        "name": "Origin",
        "type": "DropDown", 
        "value": "Manual QA" 
      } ], 
      "assignedTeams": [ { 
        "team": { 
          "id": 127065 
        } 
      } ], 
      "Description": bugContent,
    }

    return this.client.post<any, Bug>({
      pathParam: { "bugs": '' },
      param: { "format": "json" },
    }, bug) as T
  }

  async addComment<T>(userStoryId: string, comment: string): Promise<T> {
    const commentData = {
      description: comment,
      owner: {
        id: config.tp.ownerId,
      },
      general: {
        id: userStoryId,
      },
    }

    return this.client.post<any, UserStoryComment>({
      pathParam: { "comments": '' },
      param: { "format": "json" },
    }, commentData) as T
  }

}

