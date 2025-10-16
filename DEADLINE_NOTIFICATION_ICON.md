# Task Deadline Notification Icon

## Overview
A simple, focused notification icon that appears inside the project board header to alert users about tasks due within 24 hours (excluding completed tasks).

## Features

✅ **Smart Filtering**:
- Only shows tasks with due dates
- Excludes tasks with status "Done"
- Only includes tasks with assignees
- Shows tasks due within 24 hours (0-24 hours before deadline)

✅ **Visual Indicators**:
- 🔴 Red pulsing icon when urgent tasks exist
- Badge shows count of urgent tasks
- Automatically hides when no urgent tasks
- Color-coded by urgency:
  - **Red**: Due today
  - **Yellow/Orange**: Due tomorrow

✅ **User Interaction**:
- Click icon to see detailed list
- Click task to navigate to it
- Shows task details:
  - Task title
  - Due time (hours remaining)
  - Priority level
  - Current status
  - Assignee
  - Formatted due date

✅ **Auto-Refresh**:
- Tasks refresh every 5 minutes automatically
- Always shows current deadline status

## File Structure

```
src/
├── components/
│   └── ui/
│       ├── DeadlineNotificationIcon.tsx  ← Main component
│       └── index.ts                      ← Export added
└── features/
    └── project/
        └── DynamicProjectNavigation.tsx  ← Integrated here
```

## How It Works

### 1. Component Location
The notification icon appears in the **project board header**, next to the feature tabs (Backlog, Sprint, Board, etc.).

### 2. Deadline Calculation
```typescript
const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const dueDate = new Date(task.dueDate);

// Only include if:
// 1. dueDate <= tomorrow (within next 24 hours)
// 2. dueDate >= now (not overdue yet, or same day)
// 3. task.status !== "Done"
// 4. task.assignee exists
```

### 3. Visual States

**No urgent tasks:**
- Icon is hidden (returns `null`)
- User sees clean header with just tabs

**Has urgent tasks:**
- Red pulsing notification icon appears
- Badge shows count: "1", "2", "3", etc.
- Smooth animation draws attention

### 4. Click Behavior

When user clicks the icon:
1. Menu opens showing all urgent tasks
2. Tasks sorted by urgency (due today first, then tomorrow)
3. Each task shows:
   - Title (2 lines max with ellipsis)
   - Due time indicator with icon
   - Priority and status chips
   - Assignee name
   - Formatted due date

When user clicks a task:
1. Menu closes
2. Navigates to the task in Backlog/Scrum Board
3. URL includes `?taskId=X` for highlighting

## Integration Code

### In DynamicProjectNavigation.tsx

```typescript
// 1. Import required modules
import type { Task } from "@/types";
import { DeadlineNotificationIcon } from "@/components/ui";
import { TaskService } from "@/services/TaskService";

// 2. Add state for tasks
const [tasks, setTasks] = useState<Task[]>([]);

// 3. Fetch tasks with auto-refresh
useEffect(() => {
  const fetchTasks = async () => {
    const response = await TaskService.getAllTasks(projectId);
    setTasks(response.data || []);
  };

  fetchTasks();
  const interval = setInterval(fetchTasks, 5 * 60 * 1000); // 5 minutes
  return () => clearInterval(interval);
}, [projectId]);

// 4. Add icon to header (next to tabs)
<DeadlineNotificationIcon 
  tasks={tasks}
  onTaskClick={(task) => {
    // Navigate to task in backlog/scrum board
    navigate(`/projects/${projectId}/${templateType}/backlog?taskId=${task.id}`);
  }}
/>
```

## Props

```typescript
interface DeadlineNotificationIconProps {
  tasks: Task[];              // All tasks from the project
  onTaskClick?: (task: Task) => void;  // Optional click handler
}
```

## Customization

### Change Deadline Threshold

Edit `DeadlineNotificationIcon.tsx`:

```typescript
// Current: 24 hours (1 day)
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

// Change to 48 hours (2 days)
const tomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
```

### Change Refresh Interval

Edit `DynamicProjectNavigation.tsx`:

```typescript
// Current: 5 minutes
const interval = setInterval(fetchTasks, 5 * 60 * 1000);

// Change to 10 minutes
const interval = setInterval(fetchTasks, 10 * 60 * 1000);
```

### Include Overdue Tasks

Edit `DeadlineNotificationIcon.tsx`:

```typescript
// Current: Only future tasks (due <= tomorrow AND due >= now)
return dueDate <= tomorrow && dueDate >= now;

// Change to: Include overdue tasks
return dueDate <= tomorrow; // Remove the "due >= now" check
```

## Example Usage

### Scenario 1: Due Today
```
Task: "Fix critical bug"
Due: Today 5:00 PM
Current: Today 2:00 PM
Hours remaining: 3

Display:
🔴 "Due today (3h)"
Red error color
```

### Scenario 2: Due Tomorrow
```
Task: "Code review"
Due: Tomorrow 10:00 AM
Current: Today 3:00 PM
Hours remaining: 19

Display:
🟡 "Due tomorrow"
Yellow/orange warning color
```

### Scenario 3: Already Done
```
Task: "Deploy to staging"
Due: Tomorrow
Status: "Done"

Display:
❌ NOT SHOWN (excluded from list)
```

## Testing

### Test with Console

```typescript
// In browser console:
const testTask = {
  id: 1,
  title: "Test Urgent Task",
  dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
  status: "In Progress",
  assignee: "test@example.com",
  priority: "High",
  // ... other fields
};

// Icon should appear with badge count = 1
```

### Manual Testing

1. Create a task with due date = tomorrow
2. Set status = "In Progress" (not "Done")
3. Assign to someone
4. Navigate to project board
5. Should see red notification icon with badge "1"
6. Click icon to see task details
7. Click task to navigate to it

## Troubleshooting

### Icon not showing

**Check:**
1. Are there tasks with due dates within 24 hours?
2. Are those tasks NOT in "Done" status?
3. Do those tasks have assignees?
4. Check browser console for errors

### Tasks not updating

**Check:**
1. Verify TaskService.getAllTasks() is working
2. Check network tab for API calls
3. Verify 5-minute refresh interval is running
4. Check browser console for fetch errors

### Click not navigating

**Check:**
1. Verify `onTaskClick` prop is passed
2. Check that projectId and templateType are valid
3. Verify backlog or scrum_board feature exists
4. Check browser console for navigation errors

## Design Decisions

### Why only 24 hours?
- Keeps focus on truly urgent tasks
- Prevents notification fatigue
- Users can see longer-term deadlines in task lists

### Why exclude "Done" tasks?
- No action needed on completed tasks
- Reduces noise and false alarms
- Keeps notification relevant

### Why auto-hide when empty?
- Cleaner interface when not needed
- Only shows when actionable
- Reduces visual clutter

### Why 5-minute refresh?
- Balance between freshness and performance
- Prevents too many API calls
- Ensures users see recent changes

## Summary

✅ **Created**: `DeadlineNotificationIcon.tsx` - Smart notification component
✅ **Integrated**: Into project board header navigation
✅ **Features**: Auto-filtering, auto-refresh, click navigation
✅ **Zero Errors**: Full TypeScript type safety
✅ **Auto-Hide**: Only shows when needed
✅ **User-Friendly**: Clear visual indicators and interactions

The notification icon now provides instant awareness of urgent deadlines while staying out of the way when not needed!
