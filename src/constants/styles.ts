/**
 * Centralized styling constants for consistent UI design
 */

// Common spacing and sizing values
export const SPACING = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
} as const;

// Common border radius values
export const BORDER_RADIUS = {
  small: 1,
  medium: 2,
  large: 3,
  round: '50%',
} as const;

// Common shadow values
export const SHADOWS = {
  light: '0 1px 3px rgba(0,0,0,0.1)',
  medium: '0 4px 6px rgba(0,0,0,0.1)',
  heavy: '0 8px 25px rgba(0,0,0,0.15)',
} as const;

// Z-index values
export const Z_INDEX = {
  modal: 1300,
  drawer: 1200,
  appBar: 1100,
  tooltip: 1500,
  overlay: 1400,
} as const;

// Layout constants
export const LAYOUT = {
  navbar: {
    height: 68,
    bgcolor: 'white',
    borderBottom: '1px solid #e0e0e0',
  },
  sidebar: {
    width: 280,
    bgcolor: '#f7f8f9',
  },
  content: {
    padding: 3,
    bgcolor: '#fafbfc',
  },
} as const;

// Common component styles
export const COMPONENT_STYLES = {
  button: {
    primary: {
      bgcolor: '#0052CC',
      '&:hover': { bgcolor: '#0747A6' },
      textTransform: 'none',
      borderRadius: BORDER_RADIUS.medium,
      fontWeight: 600,
    },
    secondary: {
      bgcolor: 'transparent',
      color: '#5E6C84',
      '&:hover': { bgcolor: '#E6F3FF', color: '#0052CC' },
      textTransform: 'none',
      borderRadius: BORDER_RADIUS.medium,
    },
  },
  card: {
    default: {
      bgcolor: 'white',
      borderRadius: BORDER_RADIUS.medium,
      boxShadow: SHADOWS.light,
      p: SPACING.md,
    },
    elevated: {
      bgcolor: 'white',
      borderRadius: BORDER_RADIUS.medium,
      boxShadow: SHADOWS.medium,
      p: SPACING.md,
    },
  },
  input: {
    default: {
      borderRadius: BORDER_RADIUS.medium,
      '& .MuiOutlinedInput-root': {
        borderRadius: BORDER_RADIUS.medium,
      },
    },
  },
} as const;

// Animation constants
export const ANIMATIONS = {
  fast: '150ms',
  medium: '300ms',
  slow: '500ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;
