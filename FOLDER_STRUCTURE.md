# Project Folder Structure

This document outlines the well-organized folder structure for the MidLineX Frontend project.

## 📁 Root Structure

```
src/
├── api/                    # API layer
├── assets/                 # Static assets
├── components/             # React components (organized by type)
├── config/                 # Configuration files
├── constants/              # Application constants
├── context/                # React Context providers
├── data/                   # Static/mock data
├── hooks/                  # Custom React hooks
├── lib/                    # Third-party library configurations
├── pages/                  # Page components
├── services/               # Business logic services
├── store/                  # State management (if needed)
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## 🔗 API Layer (`/api`)

Centralized API communication layer:

```
api/
├── client.ts              # Axios configuration and interceptors
├── endpoints/             # API endpoint definitions
│   ├── projects.ts        # Project-related API calls
│   ├── tasks.ts           # Task-related API calls
│   └── index.ts           # Re-exports
├── types/                 # API-specific types
│   └── index.ts           # Response/Request types
└── index.ts               # Main API exports
```

## 🧩 Components (`/components`)

Organized by component type and feature:

```
components/
├── layout/                # Layout components
│   ├── Navbar.tsx         # Top navigation
│   ├── Sidebar.tsx        # Side navigation
│   └── index.ts           # Re-exports
├── ui/                    # Reusable UI components
│   ├── QuickSearch.tsx    # Search component
│   └── index.ts           # Re-exports
├── features/              # Feature-specific components
│   ├── project/           # Project-related components
│   │   ├── Project.tsx
│   │   ├── ProjectBoard.tsx
│   │   ├── ProjectBacklog.tsx
│   │   └── index.ts
│   ├── task/              # Task-related components
│   │   ├── TaskCard.tsx
│   │   ├── TaskDetailModal.tsx
│   │   └── index.ts
│   ├── kanban/            # Kanban-specific components
│   │   ├── KanbanColumn.tsx
│   │   └── index.ts
│   ├── CreateIssueModal.tsx
│   ├── CreateProjectModal.tsx
│   └── index.ts
└── index.ts               # Main component exports
```

## 🏪 Context (`/context`)

React Context providers for state management:

```
context/
├── ProjectContext.tsx     # Project state management
├── TaskContext.tsx        # Task state management
└── index.ts               # Re-exports
```

## 🔧 Utilities (`/utils`)

Organized utility functions:

```
utils/
├── formatters/            # Data formatting utilities
│   └── date.ts            # Date formatting functions
├── helpers/               # Helper functions
│   ├── common.ts          # Common utilities
│   └── task.ts            # Task-specific utilities
└── index.ts               # Re-exports (+ legacy functions)
```

## 📝 Types (`/types`)

Well-organized TypeScript definitions:

```
types/
├── common/                # Core domain types
│   ├── project.ts         # Project-related types
│   ├── task.ts            # Task-related types
│   ├── ui.ts              # UI/Navigation types
│   └── index.ts           # Re-exports
├── api/                   # API-related types
│   └── index.ts           # Request/Response types
├── components/            # Component prop types
│   └── index.ts           # Component interfaces
└── index.ts               # Main type exports
```

## 📚 Libraries (`/lib`)

Third-party library configurations:

```
lib/
├── axios/                 # Axios configuration
├── validations/           # Validation utilities
│   └── index.ts           # Validation rules and functions
└── index.ts               # Library exports
```

## 📦 Services (`/services`)

Business logic and data services:

```
services/
├── ProjectService.ts      # Project business logic
└── TaskService.ts         # Task business logic
```

## 🎯 Benefits of This Structure

### 1. **Scalability**
- Easy to add new features without cluttering
- Clear separation of concerns
- Modular architecture

### 2. **Maintainability**
- Components are grouped by feature/purpose
- Easy to locate and modify specific functionality
- Consistent import patterns

### 3. **Developer Experience**
- Autocomplete-friendly imports
- Clear file organization
- Reduced cognitive load

### 4. **Type Safety**
- Well-organized TypeScript definitions
- Domain-driven type organization
- API-first type definitions

## 🚀 Usage Examples

### Importing Components
```typescript
// Layout components
import { Navbar, Sidebar } from '@/components/layout';

// Feature components
import { TaskCard } from '@/components/features/task';
import { ProjectBoard } from '@/components/features/project';

// UI components
import { QuickSearch } from '@/components/ui';
```

### Using Context
```typescript
import { useProjectContext, useTaskContext } from '@/context';

const MyComponent = () => {
  const { state: projectState, dispatch: projectDispatch } = useProjectContext();
  const { state: taskState, dispatch: taskDispatch } = useTaskContext();
  
  // Component logic...
};
```

### API Calls
```typescript
import { projectsApi, tasksApi } from '@/api';

// Fetch projects
const projects = await projectsApi.getProjects();

// Create task
const newTask = await tasksApi.createTask(projectId, taskData);
```

### Using Utilities
```typescript
import { formatDate, getPriorityColor, truncateString } from '@/utils';

const formattedDate = formatDate(task.dueDate);
const priorityColor = getPriorityColor(task.priority);
const shortTitle = truncateString(task.title, 50);
```

## 🔄 Migration Strategy

1. **Phase 1**: Move existing components to new structure
2. **Phase 2**: Update import paths throughout the application
3. **Phase 3**: Implement new context providers
4. **Phase 4**: Refactor services to use new API layer
5. **Phase 5**: Add comprehensive type definitions

## 📋 Next Steps

1. Set up path aliases in `tsconfig.json` for clean imports
2. Update existing component imports
3. Implement context providers in the main App component
4. Create additional UI components as needed
5. Add comprehensive tests for each module
