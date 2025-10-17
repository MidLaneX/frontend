import { useCallback } from "react";
import { NotificationService } from "@/services/NotificationService";
import type { Task } from "@/types";
import { tokenManager } from "@/utils/tokenManager";

interface UseTaskNotificationsOptions {
  projectId: number;
  projectName: string;
  templateType: string;
}

export const useTaskNotifications = ({
  projectId,
  projectName,
  templateType,
}: UseTaskNotificationsOptions) => {
  // Removed sending state that was blocking notifications

  const getCurrentUserName = useCallback(() => {
    // Try to get from tokenManager
    const userEmail = tokenManager.getUserEmail();
    
    if (userEmail) {
      // Extract name from email (part before @)
      const namePart = userEmail.split('@')[0];
      const formattedName = namePart
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      console.log("👤 Current user from tokenManager:", {
        email: userEmail,
        formattedName,
      });
      return formattedName;
    }
    
    console.warn("⚠️ No user data found in tokenManager");
    return "System";
  }, []);

  const getTaskUrl = useCallback(
    (taskId: number) => {
      // Generate URL based on current location
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/projects/${projectId}/${templateType}?taskId=${taskId}`;
      console.log("🔗 Generated task URL:", url);
      return url;
    },
    [projectId, templateType]
  );

  /**
   * Send notification when task is assigned (created or assignee changed)
   */
  const sendAssignmentNotification = useCallback(
    async (task: Task, assignee: string) => {
      if (!assignee) {
        console.log("⏭️ Skipping assignment notification - no assignee:", { 
          hasAssignee: !!assignee,
          assignee 
        });
        return;
      }

      try {
        console.log("🚀 Starting assignment notification process...", {
          taskId: task.id,
          taskTitle: task.title,
          assignee,
        });

        const taskUrl = getTaskUrl(task.id);
        const currentUserName = getCurrentUserName();

        // Extract email and name from assignee string
        const assigneeEmail = NotificationService.extractEmail(assignee);
        const assigneeName = NotificationService.extractName(assignee);

        console.log("📧 Extracted notification details:", {
          assigneeEmail,
          assigneeName,
          currentUserName,
          taskUrl,
        });

        await NotificationService.sendTaskAssignmentNotification(
          task,
          projectName,
          assigneeName,
          assigneeEmail,
          currentUserName,
          taskUrl
        );

        console.log("✅ Assignment notification process completed");
      } catch (error: any) {
        console.error("❌ Assignment notification process failed:", {
          error: error.message,
          stack: error.stack,
        });
      }
    },
    [projectName, getCurrentUserName, getTaskUrl]
  );

  /**
   * Send notification when reporter is assigned to a task
   */
  const sendReporterNotification = useCallback(
    async (task: Task, reporter: string) => {
      if (!reporter) {
        console.log("⏭️ Skipping reporter notification - no reporter");
        return;
      }

      try {
        console.log("🚀 Starting reporter notification process...", {
          taskId: task.id,
          taskTitle: task.title,
          reporter,
        });

        const taskUrl = getTaskUrl(task.id);
        const currentUserName = getCurrentUserName();

        // Extract email and name from reporter string
        const reporterEmail = NotificationService.extractEmail(reporter);
        const reporterName = NotificationService.extractName(reporter);

        console.log("📧 Reporter notification details:", {
          reporterEmail,
          reporterName,
          currentUserName,
        });

        await NotificationService.sendTaskReporterNotification(
          task,
          projectName,
          reporterName,
          reporterEmail,
          currentUserName,
          taskUrl
        );

        console.log("✅ Reporter notification process completed");
      } catch (error: any) {
        console.error("❌ Reporter notification process failed:", {
          error: error.message,
          stack: error.stack,
        });
      }
    },
    [projectName, getCurrentUserName, getTaskUrl]
  );

  /**
   * Send notification when task status changes to Review
   */
  const sendReviewNotification = useCallback(
    async (task: Task, reviewer: string) => {
      if (!reviewer) {
        console.log("⏭️ Skipping review notification - no reviewer");
        return;
      }

      try {
        console.log("🚀 Starting review notification process...", {
          taskId: task.id,
          reviewer,
        });

        const taskUrl = getTaskUrl(task.id);
        const currentUserName = getCurrentUserName();

        // Extract email and name from reviewer string
        const reviewerEmail = NotificationService.extractEmail(reviewer);
        const reviewerName = NotificationService.extractName(reviewer);

        console.log("📧 Review notification details:", {
          reviewerEmail,
          reviewerName,
          currentUserName,
        });

        await NotificationService.sendTaskReviewNotification(
          task,
          projectName,
          reviewerName,
          reviewerEmail,
          currentUserName,
          taskUrl
        );

        console.log("✅ Review notification sent successfully");
      } catch (error) {
        console.error("❌ Failed to send review notification:", error);
      }
    },
    [projectName, getCurrentUserName, getTaskUrl]
  );

  /**
   * Send notifications for both assignee and reporter when task is created
   */
  const sendTaskCreationNotifications = useCallback(
    async (task: Task) => {
      console.log("🎯 Starting task creation notifications:", {
        taskId: task.id,
        taskTitle: task.title,
        hasAssignee: !!task.assignee,
        hasReporter: !!task.reporter,
        assignee: task.assignee,
        reporter: task.reporter,
      });

      try {
        const promises: Promise<void>[] = [];

        // Send to assignee if assigned
        if (task.assignee) {
          console.log("📮 Queueing assignee notification...");
          promises.push(sendAssignmentNotification(task, task.assignee));
        } else {
          console.log("⚠️ No assignee, skipping assignee notification");
        }

        // Send to reporter if assigned - using dedicated reporter notification
        if (task.reporter) {
          console.log("📮 Queueing reporter notification...");
          promises.push(sendReporterNotification(task, task.reporter));
        } else {
          console.log("⚠️ No reporter, skipping reporter notification");
        }

        if (promises.length > 0) {
          await Promise.all(promises);
          console.log("✅ Task creation notifications completed");
        } else {
          console.log("ℹ️ No notifications to send (no assignee or reporter)");
        }
      } catch (error: any) {
        console.error("❌ Failed to send task creation notifications:", {
          error: error.message,
          stack: error.stack,
        });
      }
    },
    [sendAssignmentNotification, sendReporterNotification]
  );

  /**
   * Handle status change and send appropriate notifications
   */
  const handleStatusChangeNotification = useCallback(
    async (task: Task, oldStatus: string, newStatus: string) => {
      if (oldStatus === newStatus) {
        console.log("⏭️ Skipping status change notification - status unchanged:", { 
          oldStatus, 
          newStatus
        });
        return;
      }

      console.log("📊 Status changed:", {
        taskId: task.id,
        taskTitle: task.title,
        oldStatus,
        newStatus,
        reporter: task.reporter,
        assignee: task.assignee,
      });

      try {
        // Send review notification when status changes to "Review"
        if (newStatus === "Review" && task.reporter) {
          console.log("🔍 Sending review notification to reporter...");
          await sendReviewNotification(task, task.reporter);
        } else if (newStatus === "Review") {
          console.log("⚠️ Status changed to Review but no reporter assigned");
        }

        // Send notification when status changes to "In Progress"
        if (newStatus === "In Progress" && task.assignee) {
          console.log("🚀 Sending in-progress notification to assignee...");
          await sendAssignmentNotification(task, task.assignee);
        } else if (newStatus === "In Progress") {
          console.log("⚠️ Status changed to In Progress but no assignee assigned");
        }

        console.log(`✅ Status change notification completed: ${oldStatus} -> ${newStatus}`);
      } catch (error: any) {
        console.error("❌ Failed to send status change notification:", {
          error: error.message,
          stack: error.stack,
          oldStatus,
          newStatus,
        });
      }
    },
    [sendReviewNotification, sendAssignmentNotification]
  );

  return {
    sendAssignmentNotification,
    sendReporterNotification,
    sendReviewNotification,
    sendTaskCreationNotifications,
    handleStatusChangeNotification,
  };
};
