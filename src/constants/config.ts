export const APP_CONFIG = {
  name: 'MidLineX',
  description: 'Professional Project Management Platform',
  version: '1.0.0',
} as const;

export const ROUTES = {
  HOME: '/',
  WELCOME: '/welcome',
  DASHBOARD: '/dashboard',
  PROJECT: '/projects/:projectId',
  PROJECTS: '/projects',
} as const;

export const API_ENDPOINTS = {
  PROJECTS: '/api/projects',
  TASKS: '/api/tasks',
  USERS: '/api/users',
} as const;

export const STORAGE_KEYS = {
  USER_PREFERENCES: 'midlinex_user_preferences',
  THEME: 'midlinex_theme',
  FILTERS: 'midlinex_filters',
} as const;

export const LAYOUT = {
  NAVBAR_HEIGHT: 68,
  SIDEBAR_WIDTH: 280,
  CONTENT_PADDING: 24,
} as const;
