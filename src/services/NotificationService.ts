import type { Task } from "@/types";
import { notificationsApi, type TaskAssignmentData } from "@/api/endpoints/notifications";

/**
 * Notification Service - Simple and clean
 * Follows ProjectService pattern
 */
export class NotificationService {
  /**
   * Send notification when task is assigned to someone
   */
  static async sendTaskAssignmentNotification(
    task: Task,
    projectName: string,
    assigneeEmail: string,
    assignerName: string
  ): Promise<void> {
    try {
      console.log("NotificationService: Sending assignment notification", {
        taskId: task.id,
        taskTitle: task.title,
        assigneeEmail,
        projectName,
      });

      if (!assigneeEmail) {
        console.log("NotificationService: No email, skipping");
        return;
      }

      // Extract email and name
      const email = this.extractEmail(assigneeEmail);
      const name = this.extractName(assigneeEmail);

      // Format task data
      const taskData: TaskAssignmentData = {
        assigneeName: name,
        assignerName,
        taskTitle: task.title,
        projectName,
        taskDescription: task.description || "No description",
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }) : "Not set",
        estimatedHours: task.storyPoints ? (task.storyPoints * 8).toString() : "Not estimated",
        status: task.status === "Todo" ? "To Do" : task.status,
        taskUrl: `${window.location.origin}/projects/${task.projectId}/backlog?taskId=${task.id}`,
      };

      // Send via API
      await notificationsApi.sendTaskAssignment(
        [email],
        taskData,
        task.priority === "High" || task.priority === "Highest" ? "HIGH" : "NORMAL"
      );

      console.log("NotificationService: Assignment notification sent successfully");
    } catch (error: any) {
      console.error("NotificationService: Failed to send assignment notification:", error.message);
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Send notification when someone is assigned as reporter
   */
  static async sendReporterNotification(
    task: Task,
    projectName: string,
    reporterEmail: string,
    createdBy: string
  ): Promise<void> {
    try {
      console.log("NotificationService: Sending reporter notification", {
        taskId: task.id,
        reporterEmail,
      });

      if (!reporterEmail) {
        console.log("NotificationService: No reporter email, skipping");
        return;
      }

      // Extract email and name
      const email = this.extractEmail(reporterEmail);
      const name = this.extractName(reporterEmail);

      // Format task data
      const taskData: TaskAssignmentData = {
        assigneeName: name,
        assignerName: createdBy,
        taskTitle: task.title,
        projectName,
        taskDescription: task.description || "No description",
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }) : "Not set",
        estimatedHours: task.storyPoints ? (task.storyPoints * 8).toString() : "Not estimated",
        status: task.status === "Todo" ? "To Do" : task.status,
        taskUrl: `${window.location.origin}/projects/${task.projectId}/backlog?taskId=${task.id}`,
      };

      // Send via API
      await notificationsApi.sendTaskReporter(
        [email],
        taskData,
        task.priority === "High" || task.priority === "Highest" ? "HIGH" : "NORMAL"
      );

      console.log("NotificationService: Reporter notification sent successfully");
    } catch (error: any) {
      console.error("NotificationService: Failed to send reporter notification:", error.message);
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Send notification when task status changes to Review
   */
  static async sendReviewNotification(
    task: Task,
    projectName: string,
    reviewerEmail: string,
    changedBy: string
  ): Promise<void> {
    try {
      console.log("NotificationService: Sending review notification", {
        taskId: task.id,
        reviewerEmail,
      });

      if (!reviewerEmail) {
        console.log("NotificationService: No reviewer email, skipping");
        return;
      }

      // Extract email and name
      const email = this.extractEmail(reviewerEmail);
      const name = this.extractName(reviewerEmail);

      // Format task data
      const taskData: TaskAssignmentData = {
        assigneeName: name,
        assignerName: changedBy,
        taskTitle: task.title,
        projectName,
        taskDescription: task.description || "No description",
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }) : "Not set",
        estimatedHours: task.storyPoints ? (task.storyPoints * 8).toString() : "Not estimated",
        status: "Review",
        taskUrl: `${window.location.origin}/projects/${task.projectId}/backlog?taskId=${task.id}`,
      };

      // Send via API
      await notificationsApi.sendTaskReview(
        [email],
        taskData,
        task.priority === "High" || task.priority === "Highest" ? "HIGH" : "NORMAL"
      );

      console.log("NotificationService: Review notification sent successfully");
    } catch (error: any) {
      console.error("NotificationService: Failed to send review notification:", error.message);
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Extract email from "Name <email>" or just "email"
   */
  private static extractEmail(emailString: string): string {
    if (!emailString) return "";
    const match = emailString.match(/<(.+?)>/);
    return match ? match[1] : emailString;
  }

  /**
   * Extract name from "Name <email>" or email username
   */
  private static extractName(emailString: string): string {
    if (!emailString) return "User";
    
    // Try "Name <email>" format
    const nameMatch = emailString.match(/^(.+?)\s*</);
    if (nameMatch) return nameMatch[1].trim();
    
    // Extract from email
    const emailMatch = emailString.match(/^([^@]+)/);
    if (emailMatch) {
      return emailMatch[1].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return emailString;
  }
}
