# Project Template Structure Update

## Overview
Updated the project creation flow to have **ONE template per project type** instead of multiple template options.

## Template Mapping

| Project Type | Template | Description |
|-------------|----------|-------------|
| **Software** | `scrum` | Agile development with Scrum methodology |
| **Business** | `marketing` | Marketing and business strategy projects |
| **Classic** | `traditional` | Traditional project management approach |

## What Changed

### Before
- User selects project type → User selects from multiple templates → User fills project details
- 3 steps total
- Multiple template options per type (Scrum, Kanban, Waterfall for Software, etc.)

### After
- User selects project type (template auto-assigned) → User fills project details
- **2 steps total**
- **ONE template per type** - automatically assigned based on project type selection
- Template badge shown on type selection card

## Updated Files

### 1. `src/components/ui/CreateProjectModal.tsx`

#### Changes Made:
1. **Reduced steps from 3 to 2**
   ```typescript
   const steps = ["Select Type", "Project Details"];
   ```

2. **Updated projectTypes array** - Added `template` property
   ```typescript
   const projectTypes = [
     {
       type: "Software",
       template: "scrum",  // ✅ Auto-assigned
       description: "Agile development with Scrum methodology",
       icon: SoftwareIcon,
       color: "#0052CC",
     },
     {
       type: "Business",
       template: "marketing",  // ✅ Auto-assigned
       description: "Marketing and business strategy projects",
       icon: BusinessIcon,
       color: "#00875A",
     },
     {
       type: "Classic",
       template: "traditional",  // ✅ Auto-assigned
       description: "Traditional project management approach",
       icon: ClassicIcon,
       color: "#6554C0",
     },
   ];
   ```

3. **Removed `templateOptions` object** - No longer needed
   ```typescript
   // ❌ REMOVED
   const templateOptions: Record<string, Array<{ name: string; description: string }>> = {...}
   ```

4. **Updated `handleTypeSelect`** - Now accepts both type and template
   ```typescript
   const handleTypeSelect = (type: string, template: string) => {
     setSelectedType(type as "agile" | "waterfall" | "hybrid" | "");
     setSelectedTemplate(template);
     handleNext(); // Skip template selection, go directly to project details
   };
   ```

5. **Removed `handleTemplateSelect`** - No longer needed
   ```typescript
   // ❌ REMOVED
   const handleTemplateSelect = (template: string) => {...}
   ```

6. **Updated Step 0 (Type Selection)** - Added template badge
   ```tsx
   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
     <Typography variant="h6" fontWeight={600}>
       {type.type}
     </Typography>
     <Chip 
       label={type.template.toUpperCase()} 
       size="small"
       sx={{ 
         height: 20,
         fontSize: '0.7rem',
         fontWeight: 700,
         bgcolor: `${type.color}15`,
         color: type.color,
       }}
     />
   </Box>
   ```

7. **Removed Step 1 (Template Selection)** - Entire template selection step removed
   - Step numbering adjusted: Old Step 2 (Project Details) is now Step 1

## User Experience Flow

### New Flow:
1. **Click "Create Project"** button on Dashboard
2. **Select Project Type** - Template automatically assigned and shown as badge
   - Software → SCRUM badge
   - Business → MARKETING badge
   - Classic → TRADITIONAL badge
3. **Fill Project Details** - Name, Description, Team (optional)
4. **Create Project** - Project created with auto-assigned template

## Template Badge Display

Each project type card now shows a colored badge with the template name:
- **Software** → Blue `SCRUM` badge
- **Business** → Green `MARKETING` badge  
- **Classic** → Purple `TRADITIONAL` badge

## Backend Compatibility

The modal sends the following data to the backend:
```typescript
{
  name: string,
  description: string,
  type: "Software" | "Business" | "Classic",
  templateType: "scrum" | "marketing" | "traditional",
  teamId: string (optional)
}
```

## Benefits

1. ✅ **Simplified UX** - One less step in project creation
2. ✅ **Clear mapping** - Users know exactly which template they'll get
3. ✅ **Faster workflow** - No need to choose from multiple templates
4. ✅ **Consistent structure** - Each project type has one well-defined template
5. ✅ **Better visualization** - Template shown upfront as badge

## Testing Checklist

- [ ] Create Software project → Verify `scrum` template assigned
- [ ] Create Business project → Verify `marketing` template assigned
- [ ] Create Classic project → Verify `traditional` template assigned
- [ ] Verify template badges display correctly
- [ ] Verify 2-step flow works smoothly
- [ ] Verify team assignment still works
- [ ] Verify team reassignment warning still shows
- [ ] Verify project appears in Dashboard with correct template

## Notes

- Dashboard still fetches projects using `"scrum"` as default template type in `getAllProjects()`
- This may need to be updated to fetch projects across all template types
- Consider updating `ProjectService.getAllProjects()` to accept multiple template types or fetch all

## Next Steps (Optional)

1. Update Dashboard to fetch projects from all templates, not just "scrum"
2. Add template filter in Dashboard to show projects by template type
3. Update ProjectCard to display template badge
4. Add template-specific features/views based on template type
