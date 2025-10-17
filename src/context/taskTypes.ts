import { createContext } from "react";
import type { Task } from "../types/common";

export interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
}

export type TaskAction =
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "SET_SELECTED_TASK"; payload: Task | null }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: { id: string; updates: Partial<Task> } }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

export interface TaskContextType {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
}

export const TaskContext = createContext<TaskContextType | undefined>(
  undefined,
);
