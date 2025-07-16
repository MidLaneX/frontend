# Project Structure Guide

This document outlines the professional project structure implemented for better maintainability, scalability, and developer experience.

## 📁 Directory Structure

```
src/
├── components/           # Reusable UI components
├── pages/               # Page-level components
├── hooks/               # Custom React hooks
├── services/            # Business logic and API calls
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── constants/           # Application constants
├── config/              # Configuration files
├── data/                # Static data and mock data
├── assets/              # Static assets (images, icons)
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.ts             # Barrel exports
```

## 🏗️ Architecture Overview

### Types (`src/types/`)
- Centralized TypeScript type definitions
- Improved type safety across the application
- Easy to maintain and extend

### Services (`src/services/`)
- Business logic separated from UI components
- `ProjectService` - Project management operations
- `TaskService` - Task management operations
- Consistent API for data operations

### Hooks (`src/hooks/`)
- Custom React hooks for reusable logic
- `useProjects` - Project state management
- `useTasks` - Task state management
- `useLocalStorage` - Local storage management
- `useDebounceSearch` - Debounced search functionality

### Utils (`src/utils/`)
- Pure utility functions
- Date formatting, text manipulation
- Color generation, validation helpers
- Debounce and other performance utilities

### Constants (`src/constants/`)
- Application-wide constants
- Color schemes and design tokens
- Configuration values
- Route definitions

### Config (`src/config/`)
- Theme configuration
- Application settings
- Environment-specific configurations

## 🎨 Design System

### Theme Configuration
The theme is centralized in `src/config/theme.ts` with:
- Consistent color palette
- Typography scales
- Component overrides
- Material-UI integration

### Color System
Defined in `src/constants/colors.ts`:
- Primary and secondary colors
- Status colors for tasks
- Priority-based color coding
- Semantic color definitions

## 🔧 Development Guidelines

### Import Organization
```typescript
// External libraries
import React from 'react';
import { Box, Typography } from '@mui/material';

// Internal types
import type { Task, Project } from '../types';

// Services and hooks
import { TaskService } from '../services/TaskService';
import { useTasks } from '../hooks';

// Components
import TaskCard from './TaskCard';
```

### Component Structure
```typescript
// Component with proper typing
interface ComponentProps {
  // Props definition
}

const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // Component logic
  return (
    // JSX
  );
};

export default Component;
```

### Service Usage
```typescript
// Use services for data operations
const handleCreateTask = (taskData) => {
  const newTask = TaskService.createTask(projectId, taskData);
  // Handle result
};
```

### Hook Usage
```typescript
// Use custom hooks for state management
const { tasks, loading, createTask } = useTasks(projectId);
```

## 📦 Benefits of This Structure

1. **Separation of Concerns**: Clear separation between UI, business logic, and data
2. **Reusability**: Components, hooks, and utilities can be easily reused
3. **Maintainability**: Easy to locate and modify specific functionality
4. **Scalability**: Structure supports growth and additional features
5. **Type Safety**: Comprehensive TypeScript integration
6. **Testing**: Easier to write unit tests for separated concerns
7. **Performance**: Optimized imports and bundle splitting opportunities

## 🚀 Future Enhancements

- API integration layer
- State management (Redux/Zustand)
- Error boundary implementation
- Internationalization (i18n)
- Progressive Web App features
- Automated testing setup

## 📝 Migration Notes

- Old `data.ts` split into `types/index.ts` and `data/projects.ts`
- Theme moved from `App.tsx` to `config/theme.ts`
- Import paths updated throughout the application
- Added barrel exports for cleaner imports

This structure follows industry best practices and scales well for larger applications while maintaining clarity and developer productivity.
