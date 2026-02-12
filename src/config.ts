import 'dotenv/config'

export const config = {
  ollama: {
    name: process.env.OLLAMA_MODEL || "my_qwen",
    url: process.env.OLLAMA_URL || "http://localhost:11434",
  },
  tp: {
    baseUrl: process.env.TP_BASE_URL || "https://elateral.tpondemand.com/api/",
    apiVersion: process.env.TP_API_VERSION || "v1",
    token: process.env.TP_TOKEN || "",
  }
}
