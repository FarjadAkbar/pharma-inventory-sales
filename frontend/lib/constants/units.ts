/**
 * Standard units of measurement used across the pharma inventory system
 * This mirrors the backend constants for consistency
 */

export interface UnitOption {
  value: string;
  label: string;
}

export const MEASUREMENT_UNITS: UnitOption[] = [
  { value: "%", label: "Percentage (%)" },
  { value: "mg", label: "Milligram (mg)" },
  { value: "g", label: "Gram (g)" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "ml", label: "Milliliter (ml)" },
  { value: "L", label: "Liter (L)" },
  { value: "°C", label: "Celsius (°C)" },
  { value: "°F", label: "Fahrenheit (°F)" },
  { value: "pH", label: "pH" },
  { value: "min", label: "Minutes (min)" },
  { value: "hr", label: "Hours (hr)" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
  { value: "N/A", label: "Not Applicable" },
];

/**
 * Get unit option by value
 */
export function getUnitByValue(value: string): UnitOption | undefined {
  return MEASUREMENT_UNITS.find((unit) => unit.value === value);
}

/**
 * Get unit label by value
 */
export function getUnitLabel(value: string): string {
  const unit = getUnitByValue(value);
  return unit?.label || value;
}

