/**
 * Normalizes list API responses: plain array, { data: T[] }, nested keys, or pagination shapes.
 */
export function unwrapListResponse<T = unknown>(
  res: unknown,
  nestedInData: readonly string[] = [
    "rawMaterials",
    "drugs",
    "units",
    "suppliers",
    "items",
    "docs",
    "results",
    "records",
    "rows",
  ],
): T[] {
  if (res == null) return []
  if (Array.isArray(res)) return res as T[]
  if (typeof res !== "object") return []

  const o = res as Record<string, unknown>

  for (const key of nestedInData) {
    if (Array.isArray(o[key])) return o[key] as T[]
  }

  const inner = o.data
  if (Array.isArray(inner)) return inner as T[]
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    const d = inner as Record<string, unknown>
    for (const key of nestedInData) {
      if (Array.isArray(d[key])) return d[key] as T[]
    }
  }

  return []
}
