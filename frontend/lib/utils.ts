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

/** Strip duplicated amounts from API currency strings (e.g. `"PKR 10000"` → `"PKR"`). */
export function normalizeCurrencyCode(currency: unknown): string {
  if (currency == null || String(currency).trim() === "") return "PKR"
  let s = String(currency).trim()
  s = s.replace(/\s+[\d,]+(?:\.\d+)?\s*$/g, "").trim()
  const iso = s.match(/\b([A-Z]{3})\b/i)
  if (iso) return iso[1].toUpperCase()
  const alpha = s.replace(/[^A-Za-z]/g, "")
  if (alpha.length >= 3) return alpha.slice(0, 3).toUpperCase()
  return "PKR"
}

/** Amount + ISO code only (no $); avoids mixing DollarSign icons with PKR. */
export function formatMoneyAmount(amount: unknown, currency: unknown = "PKR"): string {
  const raw =
    typeof amount === "number" && !Number.isNaN(amount)
      ? amount
      : parseFloat(String(amount ?? "").replace(/,/g, ""))
  if (Number.isNaN(raw)) return "—"
  const code = normalizeCurrencyCode(currency)
  const formatted = raw.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${formatted} ${code}`
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
