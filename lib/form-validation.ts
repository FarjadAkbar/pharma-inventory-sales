"use client"

import { validateEmail, validatePassword, validateText, validateNumber, validatePhone, getValidationError } from "./validations"

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  message?: string
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule
}

export interface ValidationErrors {
  [fieldName: string]: string
}

export class FormValidator {
  private rules: FieldValidation
  private errors: ValidationErrors = {}

  constructor(rules: FieldValidation) {
    this.rules = rules
  }

  validateField(fieldName: string, value: any): string | null {
    const rule = this.rules[fieldName]
    if (!rule) return null

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return rule.message || getValidationError(fieldName, 'required')
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `${fieldName} must be at least ${rule.minLength} characters`
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `${fieldName} must be no more than ${rule.maxLength} characters`
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${fieldName} format is invalid`
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value)
    }

    return null
  }

  validateForm(data: Record<string, any>): ValidationErrors {
    this.errors = {}
    
    for (const [fieldName, value] of Object.entries(data)) {
      const error = this.validateField(fieldName, value)
      if (error) {
        this.errors[fieldName] = error
      }
    }

    return this.errors
  }

  getFieldError(fieldName: string): string | null {
    return this.errors[fieldName] || null
  }

  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0
  }

  clearErrors(): void {
    this.errors = {}
  }

  clearFieldError(fieldName: string): void {
    delete this.errors[fieldName]
  }
}

// Common validation rules
export const commonValidationRules: FieldValidation = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address"
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    message: "Password must be at least 8 characters with uppercase, lowercase, and number"
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: "Name must be between 2 and 50 characters"
  },
  phone: {
    required: true,
    pattern: /^\+?[\d\s\-]{10,}$/,
    message: "Please enter a valid phone number"
  },
  code: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[A-Z0-9_-]+$/,
    message: "Code must be 3-20 characters, uppercase letters, numbers, hyphens, and underscores only"
  },
  quantity: {
    required: true,
    custom: (value) => {
      const num = Number(value)
      if (isNaN(num) || num <= 0) {
        return "Quantity must be a positive number"
      }
      return null
    }
  },
  price: {
    required: true,
    custom: (value) => {
      const num = Number(value)
      if (isNaN(num) || num < 0) {
        return "Price must be a non-negative number"
      }
      return null
    }
  }
}

// Pharmaceutical specific validation rules
export const pharmaValidationRules: FieldValidation = {
  ...commonValidationRules,
  drugCode: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[A-Z0-9_-]+$/,
    message: "Drug code must be 3-20 characters, uppercase letters, numbers, hyphens, and underscores only"
  },
  chemicalFormula: {
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[A-Za-z0-9\(\)\[\]\.\-\+\s]+$/,
    message: "Chemical formula contains invalid characters"
  },
  strength: {
    required: true,
    minLength: 1,
    maxLength: 20,
    pattern: /^[\d\.]+(mg|g|ml|mcg|IU|%|units?)$/i,
    message: "Strength must be a number followed by a unit (mg, g, ml, mcg, IU, %, units)"
  },
  batchNumber: {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[A-Z0-9_-]+$/,
    message: "Batch number must be 3-30 characters, uppercase letters, numbers, hyphens, and underscores only"
  },
  expiryDate: {
    required: true,
    custom: (value) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return "Please enter a valid expiry date"
      }
      if (date <= new Date()) {
        return "Expiry date must be in the future"
      }
      return null
    }
  }
}

// Form validation hooks
export function useFormValidation(rules: FieldValidation) {
  const validator = new FormValidator(rules)
  
  return {
    validateField: (fieldName: string, value: any) => validator.validateField(fieldName, value),
    validateForm: (data: Record<string, any>) => validator.validateForm(data),
    getFieldError: (fieldName: string) => validator.getFieldError(fieldName),
    hasErrors: () => validator.hasErrors(),
    clearErrors: () => validator.clearErrors(),
    clearFieldError: (fieldName: string) => validator.clearFieldError(fieldName)
  }
}
