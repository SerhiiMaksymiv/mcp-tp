import { UserStory } from "../types.js";
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

  async addComment<T>(userStoryId: string, comment: string): Promise<T> {
    return this.client.post<UserStory, string>({
      pathParam: {
        "userStories": userStoryId,
      },
      param: {
        "format": "json",
      },
    }, comment) as T
  }

}

