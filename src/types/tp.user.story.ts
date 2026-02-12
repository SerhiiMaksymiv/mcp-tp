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
