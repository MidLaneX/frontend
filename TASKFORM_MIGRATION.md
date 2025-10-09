# TaskFormDialog Migration Guide

## Overview
We have successfully created a common `TaskFormDialog` component with epic assignment functionality and enhanced story points visibility. This document outlines how to migrate all remaining features to use this common component.

## ✅ Completed Features
- ✅ **backlog/index.tsx** - Fully migrated to TaskFormDialog
- ✅ **scrum_board/index.tsx** - Fully migrated to TaskFormDialog

## 🔄 Features Requiring Migration

### Features with TaskService.createTask usage:
1. **board/index.tsx** - ⚠️ Partially started
2. **startup/index.tsx** 
3. **sixsigma/index.tsx**
4. **matrix/index.tsx** 
5. **list/index.tsx**
6. **lean/index.tsx**
7. **functional/index.tsx**
8. **calender/index.tsx**
9. **waterfall/index.tsx**
10. **sprint/SprintManagement.tsx**

## Migration Steps for Each Feature

### 1. Update Imports
**Remove:**
```tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem, // if only used for task forms
  FormControl,
  InputLabel,
  Select, // if only used for task forms
} from '@mui/material';
```

**Add:**
```tsx
import { TaskFormDialog } from '@/components/features';
```

### 2. Remove State Variables
**Remove:**
```tsx
const [newTaskData, setNewTaskData] = useState<Partial<Task>>({...});
```

**Keep:**
```tsx
const [openDialog, setOpenDialog] = useState(false);
const [editTask, setEditTask] = useState<Task | null>(null);
```

### 3. Update handleSave Function
**Change from:**
```tsx
const handleSave = async () => {
  if (!newTaskData.title) return;
  
  if (editTask) {
    await TaskService.updateTask(projectId, Number(editTask.id), newTaskData, templateType);
  } else {
    await TaskService.createTask(projectId, newTaskData as Omit<Task, 'id'>, templateType);
  }
  
  setOpenDialog(false);
  setEditTask(null);
  setNewTaskData({...}); // Remove this
  fetchTasks();
};
```

**Change to:**
```tsx
const handleSave = async (taskData: Partial<Task>) => {
  if (editTask) {
    await TaskService.updateTask(projectId, Number(editTask.id), taskData, templateType);
  } else {
    await TaskService.createTask(projectId, taskData as Omit<Task, 'id'>, templateType);
  }
  
  setOpenDialog(false);
  setEditTask(null);
  fetchTasks();
};
```

### 4. Update Edit Button Handlers
**Change from:**
```tsx
onClick={() => {
  setEditTask(task);
  setNewTaskData(task);
  setOpenDialog(true);
}}
```

**Change to:**
```tsx
onClick={() => {
  setEditTask(task);
  setOpenDialog(true);
}}
```

### 5. Replace Dialog with TaskFormDialog
**Remove entire Dialog section and replace with:**
```tsx
<TaskFormDialog
  open={openDialog}
  onClose={() => {
    setOpenDialog(false);
    setEditTask(null);
  }}
  onSave={handleSave}
  editTask={editTask}
  projectId={projectId}
  templateType={templateType}
  defaultStatus="Todo" // or appropriate default for the feature
  title="[Feature Name] Task"
  subtitle="Add or edit tasks for your [feature name]"
/>
```

### 6. Remove Helper Functions
**Remove:**
- `resetForm()` functions
- Any other task form related helper functions

### 7. Clean Up Constants (if unused elsewhere)
**Remove if only used for task forms:**
```tsx
const priorityOptions: TaskPriority[] = [...]
const typeOptions: TaskType[] = [...]
```

## TaskFormDialog Features

### ✨ Enhanced Features:
- **Epic Assignment**: Automatically loads and displays available epics for assignment
- **Story Points Visibility**: Enhanced UI with Fibonacci scale guidance and prominent display
- **Sprint Assignment**: Shows sprint information when creating tasks
- **Validation**: Built-in form validation with error messages
- **Loading States**: Proper loading indicators and disabled states
- **Professional UI**: Modern Material-UI design with proper spacing and colors

### Props Available:
```tsx
interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  editTask?: Task | null;
  projectId: number;
  templateType: string;
  defaultStatus?: TaskStatus;
  showSprintInfo?: boolean;
  sprintInfo?: {
    id: number;
    name: string;
  };
  title?: string;
  subtitle?: string;
}
```

## Benefits of Migration

1. **Code Consistency**: All features use the same task creation/editing interface
2. **Epic Assignment**: Users can now assign tasks to epics across all features
3. **Enhanced UX**: Better story points visibility and validation
4. **Maintainability**: Single component to maintain instead of 10+ duplicate dialogs
5. **Feature Parity**: All features now have the same capabilities

## Next Steps

1. Complete the migration of `board/index.tsx` (already started)
2. Migrate remaining 9 features following the pattern above
3. Test each feature to ensure task creation/editing works correctly
4. Verify epic assignment functionality works across all features
5. Remove any unused imports and constants

## Testing Checklist

For each migrated feature:
- [ ] Task creation works
- [ ] Task editing works  
- [ ] Epic assignment dropdown appears and works
- [ ] Story points field is prominent and validated
- [ ] Form validation works (required title)
- [ ] Cancel button works
- [ ] No console errors
- [ ] UI matches other migrated features