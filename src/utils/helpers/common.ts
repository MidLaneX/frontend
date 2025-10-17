// Common utility functions

// String utilities
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Array utilities
export const sortByKey = <T>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc",
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal === bVal) return 0;

    const comparison = aVal < bVal ? -1 : 1;
    return direction === "asc" ? comparison : -comparison;
  });
};

export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K,
): Record<string, T[]> => {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );
};

// Object utilities
export const omit = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};
