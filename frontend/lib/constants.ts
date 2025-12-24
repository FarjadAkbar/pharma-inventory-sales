/**
 * Common constants and options used across the application
 */

export interface SelectOption {
  value: string
  label: string
}

/**
 * Unit of Measure options for raw materials, inventory, and other items
 */
export const UNIT_OPTIONS: SelectOption[] = [
  // Weight units
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "mg", label: "Milligram (mg)" },
  // Volume units
  { value: "L", label: "Liter (L)" },
  { value: "ml", label: "Milliliter (ml)" },
  // Count/Quantity units
  { value: "pieces", label: "Pieces" },
  { value: "pcs", label: "Pieces (pcs)" }, // Alternative abbreviation
  { value: "units", label: "Units" },
  { value: "boxes", label: "Boxes" },
  { value: "bottles", label: "Bottles" },
  { value: "vials", label: "Vials" },
  { value: "tablets", label: "Tablets" },
  { value: "capsules", label: "Capsules" },
  { value: "strips", label: "Strips" },
]

/**
 * Get unit options with an optional custom unit added
 * Useful when editing existing data that might have a unit not in the standard list
 */
export function getUnitOptions(customUnit?: string): SelectOption[] {
  if (!customUnit) {
    return UNIT_OPTIONS
  }

  // Check if custom unit already exists in options
  const exists = UNIT_OPTIONS.some(opt => opt.value === customUnit)
  if (exists) {
    return UNIT_OPTIONS
  }

  // Add custom unit to the list
  return [
    ...UNIT_OPTIONS,
    { value: customUnit, label: customUnit }
  ]
}

