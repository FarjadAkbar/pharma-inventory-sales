"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import type { ApiError, ErrorBoundaryProps } from "@/lib/api-response"

export class ApiErrorBoundary extends React.Component<ErrorBoundaryProps, { error: ApiError | null }> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: any): { error: ApiError } {
    return { 
      error: {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        details: error
      }
    }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('API Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent 
          error={this.state.error} 
          reset={() => this.setState({ error: null })} 
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error: ApiError; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  )
}
