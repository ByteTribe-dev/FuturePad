// Export all services
export { default as api } from "./api";
export { default as authService } from "./authService";
export { default as letterService } from "./letterService";

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

// Export utilities
export * from "../utils/apiUtils";
export * from "../hooks/useApi";
