/**
 * Notification Service Testing Utility
 * 
 * Use this in browser console to test notification service:
 * 
 * Open DevTools Console (F12) and run:
 * ```javascript
 * // Test health check
 * await window.testNotificationHealth();
 * 
 * // Test sending notification
 * await window.testSendNotification("your-email@example.com");
 * 
 * // Full diagnostic
 * await window.runNotificationDiagnostics("your-email@example.com");
 * ```
 */

import { notificationsApi } from "@/api/endpoints/notifications";
import type { TaskAssignmentData } from "@/api/endpoints/notifications";

/**
 * Test notification service health
 */
export async function testNotificationHealth() {
  console.log("🏥 ========== NOTIFICATION HEALTH CHECK ==========");
  
  try {
    const response = await notificationsApi.healthCheck();
    console.log("✅ Health check successful:", response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("❌ Health check failed:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    return { success: false, error };
  }
}

/**
 * Test sending a simple notification
 */
export async function testSendNotification(email: string) {
  console.log("🧪 ========== TEST NOTIFICATION ==========");
  console.log("📧 Sending test notification to:", email);
  
  if (!email || !email.includes("@")) {
    console.error("❌ Invalid email format:", email);
    return { success: false, error: "Invalid email format" };
  }

  try {
    const response = await notificationsApi.testNotification(email);
    console.log("✅ Test notification sent successfully:", response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("❌ Test notification failed:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    return { success: false, error };
  }
}

/**
 * Test task assignment notification with real data
 */
export async function testTaskAssignmentNotification(email: string) {
  console.log("📧 ========== TASK ASSIGNMENT NOTIFICATION TEST ==========");
  console.log("📧 Sending to:", email);
  
  if (!email || !email.includes("@")) {
    console.error("❌ Invalid email format:", email);
    return { success: false, error: "Invalid email format" };
  }

  // Create realistic test data
  const taskData: TaskAssignmentData = {
    assigneeName: "Test User",
    assignerName: "System Admin",
    taskTitle: "Test Task - Notification System Check",
    projectName: "Test Project",
    taskDescription: "This is a test notification to verify the email system is working correctly.",
    priority: "High",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }),
    estimatedHours: "8",
    status: "To Do",
    taskUrl: `${window.location.origin}/test-task`,
  };

  console.log("📦 Task data:", JSON.stringify(taskData, null, 2));

  try {
    const response = await notificationsApi.sendTaskAssignment(
      [email],
      taskData,
      "HIGH"
    );
    console.log("✅ Task assignment notification sent successfully:", response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("❌ Task assignment notification failed:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
    return { success: false, error };
  }
}

/**
 * Run full diagnostic suite
 */
export async function runNotificationDiagnostics(email: string) {
  console.log("🔍 ========== FULL NOTIFICATION DIAGNOSTICS ==========");
  console.log("📅 Started at:", new Date().toISOString());
  console.log("📧 Test email:", email);
  console.log("🌐 Environment:", {
    origin: window.location.origin,
    userAgent: navigator.userAgent.substring(0, 50) + "...",
  });
  
  const results: any = {
    timestamp: new Date().toISOString(),
    email,
    tests: {},
  };

  // Test 1: Health Check
  console.log("\n📋 Test 1: Health Check");
  const healthResult = await testNotificationHealth();
  results.tests.healthCheck = healthResult;
  
  if (!healthResult.success) {
    console.error("⚠️ Health check failed! Skipping further tests.");
    console.log("💡 Possible issues:");
    console.log("   - Notification service is down");
    console.log("   - Network connectivity issues");
    console.log("   - CORS configuration problems");
    console.log("   - Wrong API URL:", "https://midlanex.duckdns.org/api/v1/notifications");
    return results;
  }

  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Simple Test Notification
  console.log("\n📋 Test 2: Simple Test Notification");
  const testResult = await testSendNotification(email);
  results.tests.testNotification = testResult;

  if (!testResult.success) {
    console.error("⚠️ Simple test notification failed!");
    console.log("💡 Possible issues:");
    console.log("   - Email validation failed on backend");
    console.log("   - SMTP server issues");
    console.log("   - Email template not found");
  }

  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Full Task Assignment Notification
  console.log("\n📋 Test 3: Full Task Assignment Notification");
  const taskResult = await testTaskAssignmentNotification(email);
  results.tests.taskAssignment = taskResult;

  if (!taskResult.success) {
    console.error("⚠️ Task assignment notification failed!");
    console.log("💡 Possible issues:");
    console.log("   - Template data validation failed");
    console.log("   - Missing required fields");
    console.log("   - Template rendering error");
  }

  // Final Report
  console.log("\n📊 ========== DIAGNOSTIC SUMMARY ==========");
  const allPassed = Object.values(results.tests).every((test: any) => test.success);
  
  if (allPassed) {
    console.log("✅ ALL TESTS PASSED!");
    console.log("🎉 Notification system is working correctly!");
    console.log("📬 Check your inbox:", email);
  } else {
    console.error("❌ SOME TESTS FAILED");
    const failedTests = Object.entries(results.tests)
      .filter(([, test]: any) => !test.success)
      .map(([name]) => name);
    console.error("Failed tests:", failedTests.join(", "));
    console.log("\n🔧 Troubleshooting Steps:");
    console.log("1. Check network tab in DevTools");
    console.log("2. Verify backend logs for errors");
    console.log("3. Confirm SMTP settings in backend");
    console.log("4. Test with a different email address");
  }

  console.log("\n📋 Full Results:");
  console.log(JSON.stringify(results, null, 2));
  
  return results;
}

/**
 * Quick test - just checks if notification service is reachable
 */
export async function quickHealthCheck() {
  console.log("⚡ Quick health check...");
  try {
    const response = await notificationsApi.healthCheck();
    console.log("✅ Service is UP:", response.data);
    return true;
  } catch (error) {
    console.error("❌ Service is DOWN");
    return false;
  }
}

// Expose to window for easy console access
if (typeof window !== "undefined") {
  (window as any).testNotificationHealth = testNotificationHealth;
  (window as any).testSendNotification = testSendNotification;
  (window as any).testTaskAssignmentNotification = testTaskAssignmentNotification;
  (window as any).runNotificationDiagnostics = runNotificationDiagnostics;
  (window as any).quickHealthCheck = quickHealthCheck;
  
  console.log("🔧 Notification test utilities loaded!");
  console.log("📝 Available commands:");
  console.log("   - await quickHealthCheck()");
  console.log("   - await testNotificationHealth()");
  console.log("   - await testSendNotification('your@email.com')");
  console.log("   - await testTaskAssignmentNotification('your@email.com')");
  console.log("   - await runNotificationDiagnostics('your@email.com')");
}
