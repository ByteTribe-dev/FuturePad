import api from "./api";

export interface UpdateProfileData {
  name?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  user: {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  };
}

class ProfileService {
  // Get user profile
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await api.get<ProfileResponse>("/profile");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get profile");
    }
  }

  // Update user profile
  async updateProfile(profileData: UpdateProfileData): Promise<ProfileResponse> {
    try {
      const response = await api.put<ProfileResponse>("/profile", profileData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update profile");
    }
  }
}

export default new ProfileService();
