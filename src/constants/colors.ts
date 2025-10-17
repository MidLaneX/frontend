export const COLORS = {
  primary: {
    main: "#0052CC",
    light: "#4C9AFF",
    dark: "#0047AB",
  },
  secondary: {
    main: "#36B37E",
    light: "#57D9A3",
    dark: "#00875A",
  },
  background: {
    default: "#FAFBFC",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#172B4D",
    secondary: "#5E6C84",
    disabled: "#8993A4",
  },
  success: {
    main: "#36B37E",
    light: "#E3FCEF",
  },
  warning: {
    main: "#FFAB00",
    light: "#FFF7E6",
  },
  error: {
    main: "#DE350B",
    light: "#FFEBE6",
  },
  info: {
    main: "#0065FF",
    light: "#DEEBFF",
  },
} as const;

export const PRIORITIES = {
  Highest: {
    color: "#DE350B",
    bgColor: "#FFEBE6",
  },
  High: {
    color: "#FF5630",
    bgColor: "#FFEBE6",
  },
  Medium: {
    color: "#FF8B00",
    bgColor: "#FFF7E6",
  },
  Low: {
    color: "#0065FF",
    bgColor: "#DEEBFF",
  },
  Lowest: {
    color: "#5E6C84",
    bgColor: "#F4F5F7",
  },
} as const;

export const STATUS_COLUMNS = {
  Backlog: {
    color: "#8993A4",
    bgColor: "#F8F9FA",
    borderColor: "#DFE1E6",
  },
  Todo: {
    color: "#0052CC",
    bgColor: "#DEEBFF",
    borderColor: "#B3D4FF",
  },
  "In Progress": {
    color: "#FF8B00",
    bgColor: "#FFF7E6",
    borderColor: "#FFCC99",
  },
  Review: {
    color: "#5243AA",
    bgColor: "#EAE6FF",
    borderColor: "#C7B8F0",
  },
  Done: {
    color: "#00875A",
    bgColor: "#E3FCEF",
    borderColor: "#ABF5D1",
  },
} as const;

export const TASK_TYPES = {
  Story: {
    color: "#36B37E",
    icon: "bookmark",
  },
  Bug: {
    color: "#DE350B",
    icon: "bug_report",
  },
  Task: {
    color: "#0052CC",
    icon: "task_alt",
  },
  Epic: {
    color: "#6554C0",
    icon: "flag",
  },
} as const;
