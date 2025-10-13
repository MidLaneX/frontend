import axios from "axios";
import type { AxiosResponse } from "axios";

const NOTIFICATION_BASE_URL = "http://localhost:8084/api/v1/notifications";

// Create axios instance similar to projectsApiClient
export const notificationsApiClient = axios.create({
  baseURL: NOTIFICATION_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
notificationsApiClient.interceptors.request.use(
  (config) => {
    console.log("📧 Notification API Request:", {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("❌ Notification request setup failed:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
notificationsApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("✅ Notification API Response:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ Notification API Error:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

// TypeScript interfaces for notification data
export interface NotificationRequest {
  recipients: string[];
  subject: string;
  templateName: "project-update" | "task-assignment";
  templateData: ProjectUpdateData | TaskAssignmentData;
  priority: "HIGH" | "NORMAL" | "LOW";
}

export interface ProjectUpdateData {
  projectName: string;
  recipientName: string;
  updateType: string;
  updatedBy: string;
  updateDate: string;
  updateDescription: string;
  progressPercentage: number;
  milestones: Array<{
    name: string;
    date: string;
    status: string;
  }>;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksPending: number;
  nextSteps: string[];
  projectUrl: string;
  additionalNotes: string;
}

export interface TaskAssignmentData {
  assigneeName: string;
  assignerName: string;
  taskTitle: string;
  projectName: string;
  taskDescription: string;
  priority: string;
  dueDate: string;
  estimatedHours: string;
  status: string;
  taskUrl: string;
}

// Notification API endpoints - following projects.ts pattern
export const notificationsApi = {
  /**
   * Send notification email
   */
  sendNotification: (data: NotificationRequest) => {
    console.log("🔔 notificationsApi.sendNotification called with:", JSON.stringify(data, null, 2));
    return notificationsApiClient.post<{ message: string; success: boolean }>("/send", data);
  },

  /**
   * Send task assignment notification
   */
  sendTaskAssignment: (
    recipients: string[],
    taskData: TaskAssignmentData,
    priority: "HIGH" | "NORMAL" | "LOW" = "NORMAL"
  ) => {
    console.log("📨 Sending task assignment notification to:", recipients);
    const request: NotificationRequest = {
      recipients,
      subject: `New Task Assignment: ${taskData.taskTitle}`,
      templateName: "task-assignment",
      templateData: taskData,
      priority,
    };
    return notificationsApiClient.post<{ message: string; success: boolean }>("/send", request);
  },

  /**
   * Send task reporter notification
   */
  sendTaskReporter: (
    recipients: string[],
    taskData: TaskAssignmentData,
    priority: "HIGH" | "NORMAL" | "LOW" = "NORMAL"
  ) => {
    console.log("📝 Sending task reporter notification to:", recipients);
    const request: NotificationRequest = {
      recipients,
      subject: `You are the Reporter for: ${taskData.taskTitle}`,
      templateName: "task-assignment",
      templateData: taskData,
      priority,
    };
    return notificationsApiClient.post<{ message: string; success: boolean }>("/send", request);
  },

  /**
   * Send task review notification
   */
  sendTaskReview: (
    recipients: string[],
    taskData: TaskAssignmentData,
    priority: "HIGH" | "NORMAL" | "LOW" = "NORMAL"
  ) => {
    console.log("🔍 Sending task review notification to:", recipients);
    const request: NotificationRequest = {
      recipients,
      subject: `Task Ready for Review: ${taskData.taskTitle}`,
      templateName: "task-assignment",
      templateData: taskData,
      priority,
    };
    return notificationsApiClient.post<{ message: string; success: boolean }>("/send", request);
  },
};
