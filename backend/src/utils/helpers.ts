/**
 * Utility functions for common operations
 */

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const sanitizeObject = (obj: any): any => {
  const sanitized = { ...obj };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', '__v', 'createdAt', 'updatedAt'];
  sensitiveFields.forEach(field => {
    delete sanitized[field];
  });
  
  return sanitized;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequiredFields = (data: Record<string, any>, requiredFields: string[]): string[] => {
  const errors: string[] = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors.push(`${field} is required`);
    }
  });
  
  return errors;
};

export const formatResponse = (success: boolean, message: string, data?: any): any => {
  return {
    success,
    message,
    ...(data && { data }),
    timestamp: new Date().toISOString()
  };
};
