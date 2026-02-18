// Config
export interface Config {
  llm: {
    model: string;
    url: string;
  }
  tp: {
    url: string;
    token: string;
    ownerId: string;
  }
}


// LLM
export interface LLMProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(userInput: string): Promise<string>;
}

export interface OllamaResponse {
  model: string
  created_at: string
  message: OllamaMessage
  done: boolean
  done_reason: string
  total_duration: number
  load_duration: number
  prompt_eval_count: number
  prompt_eval_duration: number
  eval_count: number
  eval_duration: number
}

export interface ToolCall {
  id: string
  function: ToolFunction
}

export interface ToolFunction {
  index: number
  name: string
  arguments: Record<string, unknown>
}

export interface ToolCallResponse {
  type: string
  text: string
}

export interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string;
  name?: string
  tool_call_id?: string
  tool_calls?: ToolCall[]
}

export interface OllamaRequest {
  model: string;
  messages: OllamaMessage[];
  stream: boolean;
  tools?: any[];
}

export interface OllamaToolRequest {
  type: string
  function: Function
}

export interface Function {
  name: string
  description?: string
  parameters: Record<string, any>
}

export interface ToolDecision {
  tool: string | null;
  arguments: Record<string, any> | null;
}


// TP
export type TpClientParameters = {
  pathParam: { [key: string]: string | undefined }, param: { [key: string]: string }
}

export interface UserStoryComment {
  ResourceType: string
  Id: number
  Description: string
  ParentId: any
  CreateDate: string
  DescriptionModifyDate: string
  IsPrivate: boolean
  IsPinned: boolean
  EntityVersion: number
  General: General
  Owner: Owner
}

export interface General {
  ResourceType: string
  Id: number
  Name: string
}

export interface Owner {
  ResourceType: string
  Id: number
  FirstName: string
  LastName: string
  Login: string
  FullName: string
}

export interface UserStory {
  ResourceType: string
  Id: number
  Name: string
  Description: string
  StartDate: string
  EndDate: any
  CreateDate: string
  ModifyDate: string
  LastCommentDate: string
  Tags: string
  NumericPriority: number
  EntityVersion: number
  EntityType: EntityType
  LastEditor: LastEditor
  Owner: Owner
  Creator: Creator
  LastCommentedUser: LastCommentedUser
  Project: Project
  LinkedTestPlan: any
  Milestone: any
  Effort: number
  EffortCompleted: number
  EffortToDo: number
  Progress: number
  TimeSpent: number
  TimeRemain: number
  LastStateChangeDate: string
  PlannedStartDate: any
  PlannedEndDate: any
  Units: string
  Release: Release
  Iteration: any
  TeamIteration: any
  Team: Team
  Priority: Priority
  EntityState: EntityState
  ResponsibleTeam: ResponsibleTeam
  InitialEstimate: number
  Feature: Feature
  Build: any
  CustomFields: CustomField[]
}

export interface EntityType {
  ResourceType: string
  Id: number
  Name: string
  IsUnitInHourOnly: boolean
}

export interface LastEditor {
  ResourceType: string
  Id: number
  FirstName: string
  LastName: string
  Login: string
  FullName: string
}

export interface Owner {
  ResourceType: string
  Id: number
  FirstName: string
  LastName: string
  Login: string
  FullName: string
}

export interface Creator {
  ResourceType: string
  Id: number
  FirstName: string
  LastName: string
  Login: string
  FullName: string
}

export interface LastCommentedUser {
  ResourceType: string
  Id: number
  FirstName: string
  LastName: string
  Login: string
  FullName: string
}

export interface Project {
  ResourceType: string
  Id: number
  Name: string
  Process: Process
}

export interface Process {
  ResourceType: string
  Id: number
}

export interface Release {
  ResourceType: string
  Id: number
  Name: string
}

export interface Team {
  ResourceType: string
  Id: number
  Name: string
  EmojiIcon: string
}

export interface Priority {
  ResourceType: string
  Id: number
  Name: string
  Importance: number
}

export interface EntityState {
  ResourceType: string
  Id: number
  Name: string
  NumericPriority: number
}

export interface ResponsibleTeam {
  ResourceType: string
  Id: number
}

export interface Feature {
  ResourceType: string
  Id: number
  Name: string
}

export interface CustomField {
  Name: string
  Type: string
  Value: any
}
