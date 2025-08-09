// Feature components
export * from './project';
export * from './task';

// Modal components
export { default as CreateIssueModal } from './CreateIssueModal';
export { default as CreateProjectModal } from './CreateProjectModal';

// Centralized scalable features
export { default as Board } from './board/Board';
export { default as Backlog } from './backlog';
export { default as Summary } from './summary/Summary';
export { default as Timeline } from './timeline/Timeline';
export { default as ProjectPage } from './project/ProjectPage';

// Template registry
export * from './project/templateRegistry';

// Feature maps
export { default as scrumFeatures } from './featureMap/scrum';
export { default as kanbanFeatures } from './featureMap/kanban';
export { default as waterfallFeatures } from './featureMap/waterfall';
