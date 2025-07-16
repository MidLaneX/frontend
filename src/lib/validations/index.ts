// Validation utility functions
export interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Common validation rules
export const required = <T>(message = 'This field is required'): ValidationRule<T> => ({
  validate: (value: T) => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined;
  },
  message,
});

export const minLength = (min: number, message?: string): ValidationRule<string> => ({
  validate: (value: string) => value.length >= min,
  message: message || `Must be at least ${min} characters`,
});

export const maxLength = (max: number, message?: string): ValidationRule<string> => ({
  validate: (value: string) => value.length <= max,
  message: message || `Must be no more than ${max} characters`,
});

export const email = (message = 'Invalid email format'): ValidationRule<string> => ({
  validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  message,
});

export const pattern = (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
  validate: (value: string) => regex.test(value),
  message,
});

// Validation runner
export const validate = <T>(value: T, rules: ValidationRule<T>[]): ValidationResult => {
  const errors: string[] = [];
  
  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Object validation
export const validateObject = <T extends Record<string, unknown>>(
  obj: T,
  schema: Partial<Record<keyof T, ValidationRule<T[keyof T]>[]>>
): Record<keyof T, ValidationResult> => {
  const result = {} as Record<keyof T, ValidationResult>;
  
  for (const [key, rules] of Object.entries(schema) as [keyof T, ValidationRule<T[keyof T]>[]][]) {
    if (rules && key in obj) {
      result[key] = validate(obj[key], rules);
    }
  }
  
  return result;
};
