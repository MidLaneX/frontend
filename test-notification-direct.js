/**
 * Direct Notification Test Script
 * Tests notification service without browser
 */

import https from 'https';
import { URL } from 'url';

const API_BASE = 'https://midlanex.duckdns.org/api/v1/notifications';
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

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            statusMessage: res.statusMessage,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            statusMessage: res.statusMessage,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testHealthCheck() {
  log('\n🏥 ========== TEST 1: HEALTH CHECK ==========', colors.blue);
  log(`📍 URL: ${API_BASE}/health`, colors.gray);
  
  try {
    const response = await makeRequest(`${API_BASE}/health`);
    
    if (response.status === 200) {
      log('✅ Health check PASSED!', colors.green);
      log(`📊 Status: ${response.status}`, colors.gray);
      log(`📦 Response: ${JSON.stringify(response.data, null, 2)}`, colors.gray);
      return true;
    } else {
      log(`❌ Health check FAILED! Status: ${response.status}`, colors.red);
      log(`📦 Response: ${JSON.stringify(response.data, null, 2)}`, colors.gray);
      return false;
    }
  } catch (error) {
    log(`❌ Health check ERROR: ${error.message}`, colors.red);
    log('💡 Possible issues:', colors.yellow);
    log('   - Service is not running', colors.yellow);
    log('   - Network connectivity problem', colors.yellow);
    log('   - CORS/SSL configuration issue', colors.yellow);
    return false;
  }
}

async function testSimpleNotification() {
  log('\n📧 ========== TEST 2: SIMPLE TEST NOTIFICATION ==========', colors.blue);
  log(`📬 Sending to: ${TEST_EMAIL}`, colors.gray);
  
  const payload = {
    email: TEST_EMAIL,
    timestamp: new Date().toISOString()
  };
  
  log(`📦 Payload: ${JSON.stringify(payload, null, 2)}`, colors.gray);
  
  try {
    const response = await makeRequest(`${API_BASE}/test`, 'POST', payload);
    
    if (response.status === 200 || response.status === 201) {
      log('✅ Test notification sent successfully!', colors.green);
      log(`📊 Status: ${response.status}`, colors.gray);
      log(`📦 Response: ${JSON.stringify(response.data, null, 2)}`, colors.gray);
      log('📬 Check your inbox: rashmikarathnayaka01@gmail.com', colors.green);
      log('⚠️  Also check SPAM folder!', colors.yellow);
      return true;
    } else {
      log(`❌ Test notification FAILED! Status: ${response.status}`, colors.red);
      log(`📦 Response: ${JSON.stringify(response.data, null, 2)}`, colors.gray);
      return false;
    }
  } catch (error) {
    log(`❌ Test notification ERROR: ${error.message}`, colors.red);
    return false;
  }
}

async function testTaskAssignmentNotification() {
  log('\n📋 ========== TEST 3: TASK ASSIGNMENT NOTIFICATION ==========', colors.blue);
  log(`📬 Sending to: ${TEST_EMAIL}`, colors.gray);
  
  const taskData = {
    assigneeName: "Rashmika Rathnayaka",
    assignerName: "System Admin (Test)",
    taskTitle: "Test Task - Notification System Verification",
    projectName: "Notification Test Project",
    taskDescription: "This is a comprehensive test notification to verify that the email notification system is working correctly with real task data.",
    priority: "High",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }),
    estimatedHours: "8",
    status: "To Do",
    taskUrl: "http://localhost:3000/test-task-123"
  };
  
  const payload = {
    recipients: [TEST_EMAIL],
    subject: `New Task Assignment: ${taskData.taskTitle}`,
    templateName: "task-assignment",
    templateData: taskData,
    priority: "HIGH"
  };
  
  log(`📦 Payload: ${JSON.stringify(payload, null, 2)}`, colors.gray);
  
  try {
    const response = await makeRequest(`${API_BASE}/send`, 'POST', payload);
    
    if (response.status === 200 || response.status === 201) {
      log('✅ Task assignment notification sent successfully!', colors.green);
      log(`📊 Status: ${response.status}`, colors.gray);
      log(`📦 Response: ${JSON.stringify(response.data, null, 2)}`, colors.gray);
      log('📬 Check your inbox: rashmikarathnayaka01@gmail.com', colors.green);
      log('📋 You should receive a formatted task assignment email', colors.green);
      log('⚠️  Also check SPAM folder!', colors.yellow);
      return true;
    } else {
      log(`❌ Task assignment notification FAILED! Status: ${response.status}`, colors.red);
      log(`📦 Response: ${JSON.stringify(response.data, null, 2)}`, colors.gray);
      return false;
    }
  } catch (error) {
    log(`❌ Task assignment notification ERROR: ${error.message}`, colors.red);
    return false;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAllTests() {
  log('═══════════════════════════════════════════════════════════', colors.blue);
  log('🔍 NOTIFICATION SERVICE DIAGNOSTIC TEST', colors.blue);
  log('═══════════════════════════════════════════════════════════', colors.blue);
  log(`📅 Test Date: ${new Date().toLocaleString()}`, colors.gray);
  log(`📧 Test Email: ${TEST_EMAIL}`, colors.gray);
  log(`🌐 API Base: ${API_BASE}`, colors.gray);
  
  const results = {
    healthCheck: false,
    simpleNotification: false,
    taskAssignment: false
  };
  
  // Test 1: Health Check
  results.healthCheck = await testHealthCheck();
  
  if (!results.healthCheck) {
    log('\n⚠️  Health check failed! Skipping further tests.', colors.yellow);
    log('💡 The notification service appears to be down or unreachable.', colors.yellow);
    printFinalReport(results);
    return;
  }
  
  await sleep(1500);
  
  // Test 2: Simple Notification
  results.simpleNotification = await testSimpleNotification();
  
  await sleep(1500);
  
  // Test 3: Task Assignment
  results.taskAssignment = await testTaskAssignmentNotification();
  
  // Final Report
  printFinalReport(results);
}

function printFinalReport(results) {
  log('\n═══════════════════════════════════════════════════════════', colors.blue);
  log('📊 TEST SUMMARY REPORT', colors.blue);
  log('═══════════════════════════════════════════════════════════', colors.blue);
  
  const passedTests = Object.values(results).filter(r => r === true).length;
  const totalTests = Object.keys(results).length;
  
  log(`\n✅ Passed: ${passedTests}/${totalTests}`, passedTests === totalTests ? colors.green : colors.yellow);
  
  log('\nTest Results:', colors.gray);
  log(`  Health Check: ${results.healthCheck ? '✅ PASS' : '❌ FAIL'}`, results.healthCheck ? colors.green : colors.red);
  log(`  Simple Notification: ${results.simpleNotification ? '✅ PASS' : '❌ FAIL'}`, results.simpleNotification ? colors.green : colors.red);
  log(`  Task Assignment: ${results.taskAssignment ? '✅ PASS' : '❌ FAIL'}`, results.taskAssignment ? colors.green : colors.red);
  
  if (passedTests === totalTests) {
    log('\n🎉 ALL TESTS PASSED!', colors.green);
    log('✅ Notification system is working correctly!', colors.green);
    log(`📬 Check your inbox: ${TEST_EMAIL}`, colors.green);
    log('📧 You should have received 2 test emails:', colors.green);
    log('   1. Simple test notification', colors.gray);
    log('   2. Task assignment notification with full details', colors.gray);
    log('\n⚠️  If you don\'t see emails, check your SPAM folder!', colors.yellow);
  } else if (results.healthCheck) {
    log('\n⚠️  PARTIAL SUCCESS', colors.yellow);
    log('✅ Service is running but some notifications failed', colors.yellow);
    log('💡 Possible issues:', colors.yellow);
    log('   - Email validation on backend', colors.gray);
    log('   - SMTP configuration', colors.gray);
    log('   - Template rendering errors', colors.gray);
  } else {
    log('\n❌ TESTS FAILED', colors.red);
    log('❌ Notification service is not responding', colors.red);
    log('💡 Troubleshooting steps:', colors.yellow);
    log('   1. Check if backend notification service is running', colors.gray);
    log('   2. Verify the API URL is correct', colors.gray);
    log('   3. Check backend logs for errors', colors.gray);
    log('   4. Test with curl or Postman', colors.gray);
  }
  
  log('\n═══════════════════════════════════════════════════════════\n', colors.blue);
}

// Run all tests
runAllTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
