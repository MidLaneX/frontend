/**
 * Direct Notification Test - Send Endpoint Only
 * Tests the /send endpoint directly since /health doesn't exist
 */

import https from 'https';
import { URL } from 'url';

const API_BASE = 'https://midlanex.duckdns.org/api/notifications';
const TEST_EMAIL = 'rashmikarathnayaka01@gmail.com';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      rejectUnauthorized: false // For self-signed certificates
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    log(`\n📤 Request Details:`, colors.gray);
    log(`   Method: ${method}`, colors.gray);
    log(`   URL: ${url}`, colors.gray);
    if (data) {
      log(`   Payload: ${JSON.stringify(data, null, 2)}`, colors.gray);
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        log(`\n📥 Response Details:`, colors.gray);
        log(`   Status: ${res.statusCode} ${res.statusMessage}`, colors.gray);
        
        try {
          const parsed = JSON.parse(responseData);
          log(`   Body: ${JSON.stringify(parsed, null, 2)}`, colors.gray);
          resolve({
            status: res.statusCode,
            statusMessage: res.statusMessage,
            data: parsed
          });
        } catch (e) {
          log(`   Body (raw): ${responseData}`, colors.gray);
          resolve({
            status: res.statusCode,
            statusMessage: res.statusMessage,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      log(`\n❌ Request Error: ${error.message}`, colors.red);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testTaskAssignmentNotification() {
  log('\n═══════════════════════════════════════════════════════════', colors.blue);
  log('📋 TESTING TASK ASSIGNMENT NOTIFICATION', colors.blue);
  log('═══════════════════════════════════════════════════════════', colors.blue);
  log(`📅 Test Date: ${new Date().toLocaleString()}`, colors.gray);
  log(`📧 Recipient: ${TEST_EMAIL}`, colors.green);
  log(`🌐 API Endpoint: ${API_BASE}/send`, colors.gray);
  
  const taskData = {
    assigneeName: "Rashmika Rathnayaka",
    assignerName: "System Admin",
    taskTitle: "Test Task - Email Notification Verification",
    projectName: "Project Management System",
    taskDescription: "This is a test email to verify that the notification system is working correctly. If you receive this email, it means the notification service is properly configured and functioning.",
    priority: "High",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }),
    estimatedHours: "8",
    status: "To Do",
    taskUrl: "http://localhost:3000/projects/1/tasks/test-123"
  };
  
  const payload = {
    recipients: [TEST_EMAIL],
    subject: `New Task Assignment: ${taskData.taskTitle}`,
    templateName: "task-assignment",
    templateData: taskData,
    priority: "HIGH"
  };
  
  log('\n📦 Notification Payload:', colors.blue);
  log(JSON.stringify(payload, null, 2), colors.gray);
  
  try {
    const response = await makeRequest(`${API_BASE}/send`, 'POST', payload);
    
    log('\n═══════════════════════════════════════════════════════════', colors.blue);
    if (response.status === 200 || response.status === 201 || response.status === 202) {
      log('✅ SUCCESS! Notification sent successfully!', colors.green);
      log('═══════════════════════════════════════════════════════════', colors.blue);
      log('\n🎉 Test completed successfully!', colors.green);
      log(`📬 Check your email: ${TEST_EMAIL}`, colors.green);
      log('\n📧 Expected Email Contents:', colors.blue);
      log('   • From: Notification Service', colors.gray);
      log(`   • Subject: New Task Assignment: ${taskData.taskTitle}`, colors.gray);
      log('   • Contains: Task details with description, priority, due date', colors.gray);
      log('\n⚠️  IMPORTANT: Check your SPAM/JUNK folder if not in inbox!', colors.yellow);
      log('\n💡 Email may take 1-2 minutes to arrive', colors.yellow);
      return true;
    } else {
      log(`❌ FAILED! Status: ${response.status}`, colors.red);
      log('═══════════════════════════════════════════════════════════', colors.blue);
      log('\n💡 Possible Issues:', colors.yellow);
      log('   • Backend validation failed', colors.gray);
      log('   • SMTP server configuration error', colors.gray);
      log('   • Template not found or rendering error', colors.gray);
      log('   • Email service rate limiting', colors.gray);
      return false;
    }
  } catch (error) {
    log('\n═══════════════════════════════════════════════════════════', colors.blue);
    log(`❌ ERROR: ${error.message}`, colors.red);
    log('═══════════════════════════════════════════════════════════', colors.blue);
    log('\n💡 Possible Issues:', colors.yellow);
    log('   • Network connectivity problem', colors.gray);
    log('   • Service is down', colors.gray);
    log('   • SSL/TLS certificate issue', colors.gray);
    log('   • Firewall blocking the request', colors.gray);
    return false;
  }
}

// Run the test
log('═══════════════════════════════════════════════════════════', colors.blue);
log('🔔 NOTIFICATION SERVICE TEST', colors.blue);
log('═══════════════════════════════════════════════════════════', colors.blue);
log('⚠️  Note: /health endpoint not available (404)', colors.yellow);
log('📧 Testing /send endpoint directly...', colors.blue);

testTaskAssignmentNotification().then(success => {
  log('\n═══════════════════════════════════════════════════════════', colors.blue);
  log('📊 FINAL RESULT', colors.blue);
  log('═══════════════════════════════════════════════════════════', colors.blue);
  
  if (success) {
    log('\n✅ Test PASSED - Email notification sent!', colors.green);
    log(`📬 Check inbox: ${TEST_EMAIL}`, colors.green);
    process.exit(0);
  } else {
    log('\n❌ Test FAILED - Could not send notification', colors.red);
    log('🔧 Check backend logs for more details', colors.yellow);
    process.exit(1);
  }
}).catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
