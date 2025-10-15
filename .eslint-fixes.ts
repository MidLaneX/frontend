// ESLint Auto-fix Script
// This script will be used by running: npm run lint -- --fix

// However, for errors that can't be auto-fixed, here are the manual fixes needed:

/* 
FIXES APPLIED:
1. Dashboard.tsx - Fixed conditional hooks by moving hooks before conditional returns
2. Dashboard.tsx - Fixed lexical declarations by wrapping case blocks with {}
3. Dashboard.tsx - Fixed 'any' types with proper types
4. Added orgId to useEffect dependencies

TODO - Apply these fixes to remaining files:
- Replace all (err: any) or (error: any) with (err) and type assertion
- Replace all unused variables with _ prefix or remove them
- Fix useEffect dependencies by adding missing deps or using useCallback
- Replace 'any' types with proper types throughout
*/
