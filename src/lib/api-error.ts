import { HTTPError } from "ky"

/**
 * `teamora-backend` answers every failure with the same body:
 * `{ error: { code, message, details? }, requestId }`. Everything a mutation
 * shows a user comes through here, so a toast quotes the server's own words
 * rather than "Request failed with status code 422".
 */
interface ApiErrorBody {
  error?: { code?: string; message?: string; details?: unknown }
  requestId?: string
}

export async function apiErrorBody(error: unknown): Promise<ApiErrorBody | null> {
  if (!(error instanceof HTTPError)) return null
  try {
    return (await error.response.clone().json()) as ApiErrorBody
  } catch {
    return null
  }
}

export async function errorMessage(
  error: unknown,
  fallback = "Đã có lỗi xảy ra.",
): Promise<string> {
  if (error instanceof HTTPError) {
    const body = await apiErrorBody(error)
    if (body?.error?.message) return body.error.message
    return `${error.response.status} ${error.response.statusText}`.trim()
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
