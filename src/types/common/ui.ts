import React from 'react';

// Navigation and UI types
export interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  isActive?: boolean;
}

export interface FilterState {
  search: string[];
  assignee: string[];
  priority: string[];
  type: string[];
  status: string[];
}

// Common utility types
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Form types
export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}
