import { UserStory } from "src/types/tp.user.story.js";
import { config } from "../config.js";
import { TpClient } from "./client.js";

export class TP {
  private client: TpClient

  constructor() {
    this.client = new TpClient({
      baseUrl: config.tp.baseUrl,
      token: config.tp.token,
    })
  }

  async getUserStory<T>(userStoryId: string): Promise<T> {
    return this.client.get<UserStory>({
      pathParam: {
        "userStories": userStoryId,
      },
      param: {
        "format": "json",
      }
    }) as T
  }
}

