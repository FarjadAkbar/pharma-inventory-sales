"use client"

import { useState } from "react"
import React from "react"
import { Button } from "@/components/ui/button"

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code?: string
  field?: string
  details?: any
}

export class ApiResponseHandler {
  static success<T>(data: T, message?: string, pagination?: any): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      pagination
    }
  }

  static error(message: string, errors?: string[], code?: string): ApiResponse {
    return {
      success: false,
      data: null,
      message,
      errors,
      code
    }
  }

  static validationError(errors: Record<string, string[]>): ApiResponse {
    const errorMessages = Object.entries(errors)
      .map(([field, fieldErrors]) => 
        fieldErrors.map(error => `${field}: ${error}`)
      )
      .flat()

    return {
      success: false,
      data: null,
      message: "Validation failed",
      errors: errorMessages
    }
  }

  static handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    return response.json().then((data: any) => {
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }
      return data as ApiResponse<T>
    })
  }

  static handleError(error: any): ApiError {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR'
      }
    }

    if (typeof error === 'string') {
      return {
        message: error,
        code: 'UNKNOWN_ERROR'
      }
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error
    }
  }
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
  success: string | null
}

export function useApiState() {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    success: null
  })

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading, error: null, success: null }))
  }

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false, success: null }))
  }

  const setSuccess = (success: string | null) => {
    setState(prev => ({ ...prev, success, isLoading: false, error: null }))
  }

  const clearMessages = () => {
    setState(prev => ({ ...prev, error: null, success: null }))
  }

  const reset = () => {
    setState({
      isLoading: false,
      error: null,
      success: null
    })
  }

  return {
    ...state,
    setLoading,
    setError,
    setSuccess,
    clearMessages,
    reset
  }
}

export interface FormState<T> extends LoadingState {
  data: T
  errors: Record<string, string>
  isDirty: boolean
}

export function useFormState<T>(initialData: T) {
  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isDirty: false,
    isLoading: false,
    error: null,
    success: null
  })

  const updateField = (field: keyof T, value: any) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      isDirty: true,
      errors: { ...prev.errors, [field]: undefined }
    }))
  }

  const updateData = (newData: Partial<T>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...newData },
      isDirty: true
    }))
  }

  const setFieldError = (field: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error }
    }))
  }

  const setErrors = (errors: Record<string, string>) => {
    setState(prev => ({
      ...prev,
      errors
    }))
  }

  const clearErrors = () => {
    setState(prev => ({
      ...prev,
      errors: {}
    }))
  }

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading, error: null, success: null }))
  }

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false, success: null }))
  }

  const setSuccess = (success: string | null) => {
    setState(prev => ({ ...prev, success, isLoading: false, error: null }))
  }

  const reset = (newData?: T) => {
    setState({
      data: newData || initialData,
      errors: {},
      isDirty: false,
      isLoading: false,
      error: null,
      success: null
    })
  }

  return {
    ...state,
    updateField,
    updateData,
    setFieldError,
    setErrors,
    clearErrors,
    setLoading,
    setError,
    setSuccess,
    reset
  }
}

// Error boundary component for API errors
export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: ApiError; reset: () => void }>
}
