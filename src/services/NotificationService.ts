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
   * Send project status update notification with PDF
   */
  static async sendProjectStatusUpdate(
    recipients: string[],
    projectData: {
      projectName: string;
      updateType: string;
      updatedBy: string;
      updateDescription: string;
      progressPercentage: number;
      milestones: Array<{ name: string; date: string; status: string }>;
      tasksCompleted: number;
      tasksInProgress: number;
      tasksPending: number;
      nextSteps: string[];
      projectUrl: string;
      additionalNotes?: string;
    }
  ): Promise<void> {
    try {
      console.log("NotificationService: Sending project status update", {
        recipients,
        projectName: projectData.projectName,
      });

      if (!recipients || recipients.length === 0) {
        console.log("NotificationService: No recipients, skipping");
        return;
      }

      // Clean email addresses
      const cleanEmails = recipients.map(email => this.extractEmail(email));

      // Format date
      const updateDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      // Prepare template data
      const templateData = {
        projectName: projectData.projectName,
        recipientName: "Team Member", // Will be personalized in backend if needed
        updateType: projectData.updateType,
        updatedBy: projectData.updatedBy,
        updateDate,
        updateDescription: projectData.updateDescription,
        progressPercentage: projectData.progressPercentage,
        milestones: projectData.milestones,
        tasksCompleted: projectData.tasksCompleted,
        tasksInProgress: projectData.tasksInProgress,
        tasksPending: projectData.tasksPending,
        nextSteps: projectData.nextSteps,
        projectUrl: projectData.projectUrl,
        additionalNotes: projectData.additionalNotes || "Thank you for your continued dedication to this project.",
      };

      // Send via API
      await notificationsApi.sendProjectUpdate(
        cleanEmails,
        templateData,
        projectData.progressPercentage >= 80 ? "HIGH" : "NORMAL"
      );

      console.log("NotificationService: Project status update sent successfully");
    } catch (error: any) {
      console.error("NotificationService: Failed to send project status update:", error.message);
      throw error; // Throw for user feedback
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
