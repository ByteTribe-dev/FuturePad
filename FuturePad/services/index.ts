// Export all services
export { default as api } from "./api";
export { default as authService } from "./authService";
export { default as letterService } from "./letterService";
export { default as profileService } from "./profileService";

// Export types
export type {
  LoginCredentials,
  RegisterData,
  User,
  AuthResponse,
} from "./authService";
export type {
  Letter,
  CreateLetterData,
  UpdateLetterData,
} from "./letterService";
export type {
  UpdateProfileData,
  ProfileResponse,
} from "./profileService";

// Export utilities
export * from "../utils/apiUtils";
export * from "../hooks/useApi";
