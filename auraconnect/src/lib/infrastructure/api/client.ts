import createClient from 'openapi-fetch'
import type { paths } from './schema'
import { logger } from '@/lib/utils/logger'

const BASE_URL = (process.env.API_URL ?? 'http://localhost:5299').replace(/\/$/, '')

export const apiClient = createClient<paths>({
  baseUrl: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.use({
  onRequest({ request, schemaPath }) {
    logger.debug('api', `→ ${request.method} ${schemaPath}`, { url: request.url })
  },

  onResponse({ request, response, schemaPath }) {
    if (!response.ok) {
      logger.warn('api', `← ${response.status} ${request.method} ${schemaPath}`, {
        url: request.url,
        status: response.status,
        statusText: response.statusText,
      })
    }
  },

  onError({ request, error, schemaPath }) {
    // "TypeError: fetch failed" with hidden cause lands here — surface everything
    logger.error('api', `✗ fetch failed: ${request.method} ${schemaPath}`, {
      url: request.url,
      baseUrl: BASE_URL,
      error: error instanceof Error ? error : new Error(String(error)),
    })
  },
})
