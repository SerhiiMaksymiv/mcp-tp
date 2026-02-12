export interface LLMProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(userInput: string): Promise<string>;
}

export interface OllamaResponse {
  response: string;
  model: string;
  done: boolean;
}

export interface ToolDecision {
  tool: string | null;
  arguments: Record<string, any> | null;
}

