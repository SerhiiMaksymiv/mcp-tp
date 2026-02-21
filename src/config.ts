import 'dotenv/config'
import { Config } from "./types.js";

export const config: Config = {
  llm: {
    model: process.env.OLLAMA_MODEL || "my_qwen",
    url: process.env.OLLAMA_URL || "http://localhost:11434",
  },
  tp: {
    url: process.env.TP_BASE_URL || "https://elateral.tpondemand.com/api/v1",
    token: process.env.TP_TOKEN || "",
    ownerId: process.env.TP_OWNER_ID || "1504",
    projectId: process.env.TP_PROJECT_ID || "59901",
    teamId: process.env.TP_TEAM_ID || "127065",
  }
}
