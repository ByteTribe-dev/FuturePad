// Validation utility functions that match server-side validation rules

// Email validation (matches server-side: /^\S+@\S+\.\S+$/)
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

// Password validation (matches server-side: min 8 chars, lowercase, uppercase, number, special char)
export const isValidPassword = (password: string): boolean => {
  if (password.length < 8) {
    return false;
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }
  
  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return false;
  }
  
  // Check for at least one special character
  if (!/[@$!%*?&#]/.test(password)) {
    return false;
  }
  
  return true;
};

// Name validation (matches server-side: min 2, max 50 chars, letters and spaces only)
export const isValidName = (name: string): boolean => {
  if (name.length < 2 || name.length > 50) {
    return false;
  }
  
  // Check that name contains only letters and spaces
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(name);
};

// Title validation (matches server-side: max 200 chars)
export const isValidTitle = (title: string): boolean => {
  return title.length > 0 && title.length <= 200;
};

// Content validation (matches server-side: max 10000 chars)
export const isValidContent = (content: string): boolean => {
  return content.length > 0 && content.length <= 10000;
};

// Mood validation (matches server-side: valid moods array)
export const isValidMood = (mood: string): boolean => {
  const validMoods = ["happy", "sad", "excited", "anxious", "grateful", "reflective", "calm", "refresh"];
  return validMoods.includes(mood.toLowerCase());
};

// Delivery date validation (must be a valid date and in the future)
export const isValidDeliveryDate = (date: Date): boolean => {
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return false;
  }
  
  // Check if date is in the future (at least 1 day from now)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return date >= tomorrow;
};

// Function to get password validation errors
export const getPasswordValidationErrors = (password: string): string[] => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[@$!%*?&#]/.test(password)) {
    errors.push("Password must contain at least one special character (@$!%*?&#)");
  }
  
  return errors;
};

// Function to get name validation errors
export const getNameValidationErrors = (name: string): string[] => {
  const errors: string[] = [];
  
  if (name.length < 2) {
    errors.push("Name must be at least 2 characters long");
  }
  
  if (name.length > 50) {
    errors.push("Name must be no more than 50 characters long");
  }
  
  // Check that name contains only letters and spaces
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name)) {
    errors.push("Name can only contain letters and spaces");
  }
  
  return errors;
};

// Function to get title validation errors
export const getTitleValidationErrors = (title: string): string[] => {
  const errors: string[] = [];
  
  if (title.length === 0) {
    errors.push("Title is required");
  } else if (title.length > 200) {
    errors.push("Title must be less than 200 characters");
  }
  
  return errors;
};

// Function to get content validation errors
export const getContentValidationErrors = (content: string): string[] => {
  const errors: string[] = [];
  
  if (content.length === 0) {
    errors.push("Content is required");
  } else if (content.length > 10000) {
    errors.push("Content must be less than 10,000 characters");
  }
  
  return errors;
};

// Function to get delivery date validation errors
export const getDeliveryDateValidationErrors = (date: Date): string[] => {
  const errors: string[] = [];
  
  if (isNaN(date.getTime())) {
    errors.push("Invalid delivery date format");
  } else {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    if (date < tomorrow) {
      errors.push("Delivery date must be at least one day in the future");
    }
  }
  
  return errors;
};

// Comprehensive form validation functions
export const validateRegistrationForm = (email: string, password: string, name: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Email validation
  if (!email.trim()) {
    errors.push("Email is required");
  } else if (!isValidEmail(email)) {
    errors.push("Please provide a valid email address");
  }

  // Password validation
  if (!password.trim()) {
    errors.push("Password is required");
  } else {
    const passwordErrors = getPasswordValidationErrors(password);
    errors.push(...passwordErrors);
  }

  // Name validation
  if (!name.trim()) {
    errors.push("Name is required");
  } else {
    const nameErrors = getNameValidationErrors(name);
    errors.push(...nameErrors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLoginForm = (email: string, password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Email validation
  if (!email.trim()) {
    errors.push("Email is required");
  } else if (!isValidEmail(email)) {
    errors.push("Please provide a valid email address");
  }

  // Password validation
  if (!password.trim()) {
    errors.push("Password is required");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLetterForm = (title: string, content: string, deliveryDate?: Date, mood?: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Title validation
  if (!title.trim()) {
    errors.push("Title is required");
  } else {
    const titleErrors = getTitleValidationErrors(title);
    errors.push(...titleErrors);
  }

  // Content validation
  if (!content.trim()) {
    errors.push("Content is required");
  } else {
    const contentErrors = getContentValidationErrors(content);
    errors.push(...contentErrors);
  }

  // Delivery date validation
  if (!deliveryDate) {
    errors.push("Delivery date is required");
  } else {
    const dateErrors = getDeliveryDateValidationErrors(deliveryDate);
    errors.push(...dateErrors);
  }

  // Mood validation (if provided)
  if (mood && !isValidMood(mood)) {
    errors.push(`Invalid mood. Must be one of: happy, sad, excited, anxious, grateful, reflective, calm, refresh`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};