"use client"

import React, { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { useFormState, FormState } from "@/lib/api-response"
import { useFormValidation, FormValidator } from "@/lib/form-validation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface FormFieldProps {
  label: string
  name: string
  required?: boolean
  error?: string
  helpText?: string
  className?: string
  children: React.ReactNode
}

export function FormField({ 
  label, 
  name, 
  required = false, 
  error, 
  helpText, 
  className,
  children 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
    </div>
  )
}

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  helpText?: string
  required?: boolean
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, label, helpText, required, ...props }, ref) => {
    const input = (
      <Input
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
    )

    if (label) {
      return (
        <FormField
          label={label}
          name={props.name || ""}
          required={required}
          error={error}
          helpText={helpText}
        >
          {input}
        </FormField>
      )
    }

    return input
  }
)
FormInput.displayName = "FormInput"

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
  helpText?: string
  required?: boolean
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, error, label, helpText, required, ...props }, ref) => {
    const textarea = (
      <Textarea
        className={cn(
          "min-h-[80px]",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
    )

    if (label) {
      return (
        <FormField
          label={label}
          name={props.name || ""}
          required={required}
          error={error}
          helpText={helpText}
        >
          {textarea}
        </FormField>
      )
    }

    return textarea
  }
)
FormTextarea.displayName = "FormTextarea"

export interface FormSelectProps {
  error?: string
  label?: string
  helpText?: string
  required?: boolean
  options: { value: string; label: string; disabled?: boolean }[]
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  name?: string
  disabled?: boolean
  className?: string
}

export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  ({ className, error, label, helpText, required, options, placeholder, value, onChange, name, disabled }, ref) => {
    const handleValueChange = (newValue: string) => {
      if (onChange) {
        onChange(newValue)
      }
    }

    const select = (
      <>
        {name && (
          <input type="hidden" name={name} value={value || ""} />
        )}
        <Select
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <SelectTrigger
            ref={ref}
            className={cn(
              "w-full",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            aria-invalid={error ? "true" : undefined}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </>
    )

    if (label) {
      return (
        <FormField
          label={label}
          name={name || ""}
          required={required}
          error={error}
          helpText={helpText}
        >
          {select}
        </FormField>
      )
    }

    return select
  }
)
FormSelect.displayName = "FormSelect"

export interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  helpText?: string
  required?: boolean
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ className, error, label, helpText, required, ...props }, ref) => {
    const checkbox = (
      <input
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    )

    if (label) {
      return (
        <FormField
          label={label}
          name={props.name || ""}
          required={required}
          error={error}
          helpText={helpText}
        >
          <div className="flex items-center space-x-2">
            {checkbox}
            <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
            </span>
          </div>
        </FormField>
      )
    }

    return checkbox
  }
)
FormCheckbox.displayName = "FormCheckbox"

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: ((data: any) => Promise<void> | void) | ((e: React.FormEvent<HTMLFormElement>) => Promise<void> | void)
  validation?: FormValidator
  loading?: boolean
  error?: string
  success?: string
  children: React.ReactNode
}

export function Form({ 
  onSubmit, 
  validation, 
  loading = false, 
  error, 
  success, 
  children, 
  className,
  ...props 
}: FormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (loading) return

    try {
      // Try calling onSubmit with event first (for controlled components)
      // If it's a function that expects an event, it will handle it
      const result = onSubmit(e as any)
      if (result instanceof Promise) {
        await result
      }
      return
    } catch (err) {
      // If calling with event fails, try with FormData (for uncontrolled components)
      const formData = new FormData(e.currentTarget)
      const data = Object.fromEntries(formData.entries())

      if (validation) {
        const errors = validation.validateForm(data)
        if (validation.hasErrors()) {
          return
        }
      }

      try {
        await onSubmit(data)
      } catch (submitErr) {
        console.error('Form submission error:', submitErr)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)} {...props}>
      {error && (
        <div className="rounded-md bg-destructive/15 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="rounded-md bg-green-500/15 p-3">
          <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}

      {children}
    </form>
  )
}

export interface FormActionsProps {
  loading?: boolean
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
  className?: string
}

export function FormActions({ 
  loading = false, 
  onCancel, 
  submitLabel = "Save", 
  cancelLabel = "Cancel",
  className 
}: FormActionsProps) {
  return (
    <div className={cn("flex justify-end space-x-2", className)}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelLabel}
        </button>
      )}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </div>
  )
}
