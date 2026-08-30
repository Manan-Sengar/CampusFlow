import type { ApiErrorBody } from './types.ts'

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
).replace(/\/+$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body' | 'credentials'> & {
  body?: unknown
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (!value || typeof value !== 'object' || !('error' in value)) {
    return false
  }

  const error = value.error

  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      typeof error.code === 'string' &&
      'message' in error &&
      typeof error.message === 'string',
  )
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()

  if (!text) {
    return undefined
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  let body: BodyInit | undefined

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.body)
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      ...options,
      body,
      credentials: 'include',
      headers,
    })
  } catch (error) {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'CampusFlow could not reach the server. Please try again.',
      error,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const payload = await readResponseBody(response)

  if (!response.ok) {
    if (isApiErrorBody(payload)) {
      throw new ApiError(
        response.status,
        payload.error.code,
        payload.error.message,
        payload.error.details,
      )
    }

    throw new ApiError(
      response.status,
      `HTTP_${response.status}`,
      response.statusText || 'The request could not be completed.',
    )
  }

  return payload as T
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
