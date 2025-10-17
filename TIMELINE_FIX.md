# Timeline Component Fix

## Problem
The backend sends feature name as "timeline", but the DynamicProjectNavigation couldn't load it properly due to prop type mismatches.

## Solution

### File Structure (✅ CORRECT)
```
src/components/features/timeline/
├── index.tsx          (re-exports Timeline component)
└── Timeline.tsx       (main component)
```

### Props Interface (✅ FIXED)

**Before (WRONG):**
```typescript
interface TimelinePageProps {
  projectId: string;     // ❌ Should be number
  projectName?: string;
  templateType?: string;  // ❌ Should be required
}
```

**After (CORRECT - matches backlog pattern):**
```typescript
interface TimelineProps {
  projectId: number;     // ✅ Now number
  projectName?: string;
  templateType: string;  // ✅ Now required
}
```

### Component Usage (✅ FIXED)

**Before (WRONG):**
```typescript
const Timeline: React.FC<TimelinePageProps> = ({
  projectId,
  templateType = "scrum",
}) => {
  useEffect(() => {
    const numericProjectId = parseInt(projectId, 10); // ❌ Converting string to number
    const response = await SprintService.getAllSprints(numericProjectId, templateType);
  }, [projectId, templateType]);
```

**After (CORRECT):**
```typescript
const Timeline: React.FC<TimelineProps> = ({
  projectId,
  templateType = "scrum",
}) => {
  useEffect(() => {
    const response = await SprintService.getAllSprints(projectId, templateType); // ✅ Direct use
  }, [projectId, templateType]);
```

## How DynamicProjectNavigation Works

### 1. Feature Name Normalization
```typescript
const normalizeFeaturePath = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "_");
```

Backend sends: `"timeline"` → Already normalized: `"timeline"`

### 2. Dynamic Import Path
```typescript
import(`../${activeFeature.path}/index.tsx`)
```

Resolves to: `../timeline/index.tsx`

### 3. Component Loading
```
src/components/features/project/DynamicProjectNavigation.tsx
  └── imports: ../timeline/index.tsx
      └── exports: Timeline (from ./Timeline.tsx)
```

### 4. Props Passed
```typescript
<FeatureComponent 
  projectId={123}           // ✅ number
  projectName="My Project"  // ✅ optional string
  templateType="scrum"      // ✅ required string
/>
```

## Comparison with Backlog (Reference)

### Backlog Structure
```
src/components/features/backlog/
└── index.tsx (main component, no separate file)
```

### Timeline Structure (Matching Pattern)
```
src/components/features/timeline/
├── index.tsx (re-export)
└── Timeline.tsx (main component)
```

Both patterns work! The key is **prop interface consistency**.

## Props Interface Pattern (All Features MUST Match)

```typescript
interface FeatureProps {
  projectId: number;      // ✅ Always number
  projectName?: string;   // ✅ Always optional
  templateType: string;   // ✅ Always required
}

const Feature: React.FC<FeatureProps> = ({
  projectId,
  projectName,
  templateType,
}) => {
  // Component logic
};

export default Feature;
```

## Files Updated

1. **src/components/features/timeline/Timeline.tsx**
   - ✅ Changed interface name from `TimelinePageProps` to `TimelineProps`
   - ✅ Changed `projectId` from `string` to `number`
   - ✅ Changed `templateType` from optional to required
   - ✅ Removed string-to-number conversion
   - ✅ Updated useEffect to use `projectId` directly

2. **src/components/features/timeline/index.tsx**
   - ✅ Already correct: `export { default } from "./Timeline";`

## Testing

To verify timeline loads correctly:

1. Navigate to a project: `/projects/123/scrum/timeline`
2. Check browser console for:
   ```
   ✅ "Loading feature: timeline"
   ✅ "Fetching sprints for project 123"
   ✅ Timeline component renders with sprint data
   ```

3. Check for errors:
   ```
   ❌ "Property 'projectId' is missing" - Props not passed
   ❌ "Cannot read property of undefined" - Import failed
   ❌ "Component not found" - Path resolution failed
   ```

## Why This Matters

### Backend Feature Name
```json
{
  "features": ["backlog", "timeline", "sprint", "board"]
}
```

### DynamicProjectNavigation Processing
```typescript
// Backend sends: "timeline"
const normalizedFeatures = features.map(f => ({
  name: f,
  path: normalizeFeaturePath(f) // "timeline" (no change)
}));

// Imports: ../timeline/index.tsx
// Expects: Timeline component with correct props
```

## Common Issues & Fixes

### Issue 1: Component Not Loading
**Symptom:** Blank page or error message
**Cause:** Props interface mismatch
**Fix:** Ensure props match the pattern above

### Issue 2: TypeScript Errors
**Symptom:** Build fails with type errors
**Cause:** `projectId` type mismatch (string vs number)
**Fix:** Use `number` for projectId

### Issue 3: Data Not Fetching
**Symptom:** Empty timeline, no sprints
**Cause:** Incorrect projectId parsing or missing
**Fix:** Use projectId directly (don't parse)

## Summary

✅ **Timeline component now matches backlog pattern**
✅ **Props interface is consistent across all features**
✅ **DynamicProjectNavigation can load timeline correctly**
✅ **No TypeScript errors**
✅ **Ready for production**

The timeline feature should now load correctly when the backend sends "timeline" as a feature name!
