// Test file to verify user_id extraction works correctly
import { tokenManager } from "./utils/tokenManager";
import type { AuthResponse } from "./api/endpoints/auth";

// Mock backend response with user_id
const mockAuthResponse: AuthResponse = {
  access_token: "mock_access_token",
  refresh_token: "mock_refresh_token",
  token_type: "Bearer",
  expires_in: 3600,
  user_email: "test@example.com",
  role: "user",
  user_id: 12345, // This is how backend sends it
};

// Test the token manager
console.log("Testing user_id extraction...");

// Store tokens
tokenManager.setTokens(mockAuthResponse);

// Retrieve user_id
const storedUserId = tokenManager.getUserId();
console.log("Stored user_id:", storedUserId);

// Should be 12345
if (storedUserId === 12345) {
  console.log("✅ Success: user_id correctly extracted and stored");
} else {
  console.log("❌ Failed: user_id not correctly extracted");
}

// Clean up
tokenManager.clearTokens();
