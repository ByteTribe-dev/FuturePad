import Toast from 'react-native-toast-message';

// Toast service wrapper for consistent notifications
export const toastService = {
  // Show error toast
  showError: (message: string, title?: string) => {
    Toast.show({
      type: 'error',
      text1: title || 'Error',
      text2: message,
      position: 'bottom'
    });
  },

  // Show success toast
  showSuccess: (message: string, title?: string) => {
    Toast.show({
      type: 'success',
      text1: title || 'Success',
      text2: message,
      position: 'bottom'
    });
  },

  // Show delete toast
  showDelete: (message: string, title?: string) => {
    Toast.show({
      type: 'delete',
      text1: title || 'Deleted',
      text2: message,
      position: 'bottom'
    });
  },

  // Show custom toast with specific type
  show: (type: 'success' | 'error' | 'delete', message: string, title?: string) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
      position: 'bottom'
    });
  },

  // Hide all toasts
  hide: () => {
    Toast.hide();
  }
};

// Function to show multiple form validation errors as individual toasts
export const showFormValidationErrors = (errors: string[]) => {
  // Show the first error as a toast
  if (errors.length > 0) {
    toastService.showError(errors[0]);
  }
  
  // For multiple errors, we could implement a way to show them one by one
  // or show a summary if there are too many
  if (errors.length > 1) {
    console.log('Additional validation errors:', errors.slice(1));
  }
};

// Function to show field-specific error toasts
export const showFieldError = (fieldName: string, error: string) => {
  toastService.showError(error, `${fieldName} Error`);
};