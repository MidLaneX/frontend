// Re-export all types from organized modules
export * from "./common";
export * from "./api";
export * from "./components";

// Legacy exports for backward compatibility
// TODO: Remove these after refactoring components
export type {
  Task,
  Comment,
  Project,
  ProjectTimeline,
  TeamMember,
  ProjectType,
  TaskStatus,
  TaskPriority,
  TaskType,
  NavigationItem,
  ProjectItem,
  FilterState,
} from "./common";
