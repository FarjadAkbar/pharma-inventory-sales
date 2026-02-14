import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(date: string | number | Date): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return ""
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d)
}

export function formatDateISO(date: string | number | Date): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}
