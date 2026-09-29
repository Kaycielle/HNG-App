/** Create a unique id for a new record. */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback for older browsers or non-secure (http://) pages where randomUUID is unavailable.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
