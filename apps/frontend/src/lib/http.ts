import { API_BASE_URL } from '@/lib/api'

type ApiEnvelope<T> = {
  data: T
  meta?: unknown
}

type ApiErrorEnvelope = {
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}

export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor({
    status,
    message,
    code,
    details,
  }: {
    status: number
    message: string
    code?: string
    details?: unknown
  }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers:
      init?.body instanceof FormData
        ? init.headers
        : {
            'Content-Type': 'application/json',
            ...init?.headers,
          },
    ...init,
  })

  const payload = (await readPayload(response)) as
    | ApiEnvelope<T>
    | ApiErrorEnvelope
    | T

  if (!response.ok) {
    const errorPayload = payload as ApiErrorEnvelope

    throw new ApiError({
      status: response.status,
      code: errorPayload.error?.code,
      message:
        errorPayload.error?.message ||
        `Request failed with status ${response.status}`,
      details: errorPayload.error?.details,
    })
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data
  }

  return payload as T
}

async function readPayload(response: Response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  return JSON.parse(text)
}
