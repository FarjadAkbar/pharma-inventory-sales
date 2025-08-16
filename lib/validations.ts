export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export const validateText = (text: string, minLength = 1, maxLength = 255): boolean => {
  return text.trim().length >= minLength && text.trim().length <= maxLength
}

export const validateNumber = (value: string | number): boolean => {
  const num = typeof value === "string" ? Number.parseFloat(value) : value
  return !isNaN(num) && isFinite(num)
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
  return phoneRegex.test(phone)
}

// Validation error messages
export const getValidationError = (field: string, type: string): string => {
  const errors: Record<string, Record<string, string>> = {
    email: {
      invalid: "Please enter a valid email address",
      required: "Email is required",
    },
    password: {
      invalid: "Password must be at least 8 characters with uppercase, lowercase, and number",
      required: "Password is required",
    },
    name: {
      invalid: "Name must be between 2 and 50 characters",
      required: "Name is required",
    },
    phone: {
      invalid: "Please enter a valid phone number",
      required: "Phone number is required",
    },
    url: {
      invalid: "Please enter a valid URL",
      required: "URL is required",
    },
  }

  return errors[field]?.[type] || `${field} is invalid`
}
