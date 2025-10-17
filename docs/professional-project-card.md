# Professional Project Card with Team Assignment

The updated ProjectCard now displays team assignment status in a professional, Jira-like manner.

## Features

### Visual Design

- **Top Color Bar**: Green for assigned teams, gray for unassigned
- **Professional Typography**: Clear hierarchy and spacing
- **Status Indicators**: Visual chips for project type, template, and status
- **Team Section**: Dedicated section showing assignment status

### Team Assignment Display

#### Assigned Teams

- ✅ Green team icon with team name
- 👥 Member count display
- 🏷️ Multiple teams indicator chip
- 👤 Team member avatars

#### Unassigned Projects

- ⚪ Gray icon with "Unassigned" text
- 💡 Italicized text for visual distinction
- 🔧 "Assign Team" option in context menu

## Usage

### Project Data Structure

```typescript
const project = {
  id: "1",
  name: "E-commerce Platform",
  type: "SOFTWARE",
  templateType: "scrum",
  assignedTeams: [{ id: 1, name: "Development Team Alpha", memberCount: 8 }],
  teamMembers: [
    { name: "John Doe" },
    { name: "Jane Smith" },
    { name: "Mike Johnson" },
  ],
  tasks: [{ status: "Done" }, { status: "In Progress" }, { status: "To Do" }],
  timeline: {
    start: "2024-01-15",
    end: "2024-06-30",
  },
};
```

### Component Usage

```tsx
<ProjectCard
  project={project}
  isStarred={false}
  onToggleStar={(id, e) => handleStar(id, e)}
  onTeamAssigned={() => refreshProject()}
/>
```

## Professional Elements

### Header

- Project name in professional typography
- Type and template chips with borders
- Star and menu icons with hover effects

### Team Assignment Section

- Clear section label
- Visual status indicators
- Member count information
- Professional color coding

### Progress Section

- Visual progress bar
- Percentage display
- Color-coded completion status

### Timeline

- Calendar icon with date range
- Formatted date display

### Footer

- Status chip with color coding
- Completion percentage
- Clean layout alignment

### Context Menu

- Professional styling with shadows
- Descriptive menu items
- Secondary text for context
- Conditional text (Assign vs Reassign)

## Team Assignment States

### State 1: No Teams Assigned

```
Team Assignment
👤 Unassigned                    [Assign Team]
```

### State 2: Single Team Assigned

```
Team Assignment                   8 members
👥 Development Team Alpha         [Reassign Team]
```

### State 3: Multiple Teams Assigned

```
Team Assignment                   15 members
👥 2 teams                +1 more [Reassign Team]
```

## Color Coding

- **Assigned Teams**: Green (#00875A)
- **Unassigned**: Gray (#5E6C84)
- **Status Colors**: Dynamic based on project status
- **Hover Effects**: Subtle elevation and color changes

This creates a professional, Jira-like appearance that clearly communicates team assignment status while maintaining visual hierarchy and usability.
