import { apiClient } from "../api/client";

// User profile types
export interface UserProfile {
  user_id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  job_title: string;
  department: string;
  role: {
    id: number;
    name: string;
    permissions: string;
    created_at: string;
    updated_at: string;
  };
  created_at: string;
}

export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
}

export class UserService {
  private static readonly BASE_PATH = "/auth/user";

  /**
   * Get user profile by user ID
   */
  static async getUserProfile(userId: number): Promise<UserProfile> {
    try {
      console.log("Fetching user profile for userId:", userId);

      const response = await apiClient.get(
        `${this.BASE_PATH}/profile/${userId}`,
      );

      console.log("User profile response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching user profile:", error);

      if (error.response?.status === 404) {
        throw new Error("User profile not found");
      } else if (error.response?.status === 403) {
        throw new Error("Access denied to user profile");
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Failed to fetch user profile");
      }
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: number,
    updateData: UpdateUserProfileRequest,
  ): Promise<UserProfile> {
    try {
      console.log(
        "Updating user profile for userId:",
        userId,
        "with data:",
        updateData,
      );

      const response = await apiClient.put(
        `${this.BASE_PATH}/profile/${userId}`,
        updateData,
      );

      console.log("Updated user profile response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error updating user profile:", error);

      if (error.response?.status === 404) {
        throw new Error("User profile not found");
      } else if (error.response?.status === 403) {
        throw new Error("Access denied to update user profile");
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || "Invalid profile data");
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Failed to update user profile");
      }
    }
  }
}
