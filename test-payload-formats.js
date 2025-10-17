/**
 * Simple notification test - minimal payload
 */

import https from 'https';
import { URL } from 'url';

const API_BASE = 'https://midlanex.duckdns.org/api/notifications';
const TEST_EMAIL = 'rashmikarathnayaka01@gmail.com';

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
      rejectUnauthorized: false
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    log(`\n📤 ${method} ${url}`, colors.blue);
    if (data) {
      log(`📦 Payload: ${JSON.stringify(data, null, 2)}`, colors.gray);
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        log(`\n📥 Status: ${res.statusCode} ${res.statusMessage}`, colors.gray);
        
        try {
          const parsed = JSON.parse(responseData);
          log(`📦 Response: ${JSON.stringify(parsed, null, 2)}`, colors.gray);
          resolve({
            status: res.statusCode,
            statusMessage: res.statusMessage,
            data: parsed
          });
        } catch (e) {
          if (responseData) {
            log(`📦 Response (raw): ${responseData}`, colors.gray);
          } else {
            log(`📦 Response: (empty)`, colors.gray);
          }
          resolve({
            status: res.statusCode,
            statusMessage: res.statusMessage,
            data: responseData || null
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

async function testSimplePayload() {
  log('\n═══════════════════════════════════════════════════════════', colors.blue);
  log('🧪 TEST 1: MINIMAL PAYLOAD', colors.blue);
  log('═══════════════════════════════════════════════════════════', colors.blue);
  
  const payload = {
    recipients: [TEST_EMAIL],
    subject: "Test Email",
    message: "This is a test email"
  };
  
  try {
    const response = await makeRequest(`${API_BASE}/send`, 'POST', payload);
    
    if (response.status >= 200 && response.status < 300) {
      log('\n✅ SUCCESS!', colors.green);
      return true;
    } else {
      log(`\n❌ FAILED: ${response.status}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, colors.red);
    return false;
  }
}

async function testWithTemplate() {
  log('\n═══════════════════════════════════════════════════════════', colors.blue);
  log('🧪 TEST 2: WITH TEMPLATE', colors.blue);
  log('═══════════════════════════════════════════════════════════', colors.blue);
  
  const payload = {
    recipients: [TEST_EMAIL],
    subject: "New Task Assignment: Test Task",
    templateName: "task-assignment",
    templateData: {
      assigneeName: "Rashmika Rathnayaka",
      assignerName: "System Admin",
      taskTitle: "Test Task",
      projectName: "Test Project",
      taskDescription: "Test description",
      priority: "High",
      dueDate: "October 22, 2025",
      estimatedHours: "8",
      status: "To Do",
      taskUrl: "http://localhost:3000"
    },
    priority: "HIGH"
  };
  
  try {
    const response = await makeRequest(`${API_BASE}/send`, 'POST', payload);
    
    if (response.status >= 200 && response.status < 300) {
      log('\n✅ SUCCESS!', colors.green);
      return true;
    } else {
      log(`\n❌ FAILED: ${response.status}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, colors.red);
    return false;
  }
}

async function testWithoutTemplate() {
  log('\n═══════════════════════════════════════════════════════════', colors.blue);
  log('🧪 TEST 3: WITHOUT TEMPLATE (PLAIN TEXT)', colors.blue);
  log('═══════════════════════════════════════════════════════════', colors.blue);
  
  const payload = {
    recipients: [TEST_EMAIL],
    subject: "Test Notification",
    body: "This is a plain text test email.",
    priority: "NORMAL"
  };
  
  try {
    const response = await makeRequest(`${API_BASE}/send`, 'POST', payload);
    
    if (response.status >= 200 && response.status < 300) {
      log('\n✅ SUCCESS!', colors.green);
      return true;
    } else {
      log(`\n❌ FAILED: ${response.status}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, colors.red);
    return false;
  }
}

async function runTests() {
  log('═══════════════════════════════════════════════════════════', colors.blue);
  log('🔔 NOTIFICATION ENDPOINT TESTING', colors.blue);
  log('═══════════════════════════════════════════════════════════', colors.blue);
  log(`📧 Test Email: ${TEST_EMAIL}`, colors.green);
  log(`🌐 API Base: ${API_BASE}`, colors.gray);
  
  const results = {
    simple: false,
    template: false,
    plain: false
  };
  
  // Test 1: Simple payload
  results.simple = await testSimplePayload();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: With template
  results.template = await testWithTemplate();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Plain text
  results.plain = await testWithoutTemplate();
  
  // Summary
  log('\n═══════════════════════════════════════════════════════════', colors.blue);
  log('📊 TEST SUMMARY', colors.blue);
  log('═══════════════════════════════════════════════════════════', colors.blue);
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  log(`\nResults: ${passed}/${total} passed\n`, colors.gray);
  log(`  Simple Payload:  ${results.simple ? '✅ PASS' : '❌ FAIL'}`, results.simple ? colors.green : colors.red);
  log(`  With Template:   ${results.template ? '✅ PASS' : '❌ FAIL'}`, results.template ? colors.green : colors.red);
  log(`  Plain Text:      ${results.plain ? '✅ PASS' : '❌ FAIL'}`, results.plain ? colors.green : colors.red);
  
  if (passed > 0) {
    log('\n✅ At least one format works!', colors.green);
    log(`📬 Check your inbox: ${TEST_EMAIL}`, colors.green);
    log('⚠️  Also check SPAM folder!', colors.yellow);
  } else {
    log('\n❌ All tests failed', colors.red);
    log('💡 Backend may be expecting a different payload format', colors.yellow);
    log('🔧 Check backend logs for detailed error messages', colors.yellow);
  }
  
  log('\n═══════════════════════════════════════════════════════════\n', colors.blue);
}

runTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, colors.red);
  process.exit(1);
});
