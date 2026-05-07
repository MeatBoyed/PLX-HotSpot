import createClient from 'openapi-fetch'
import type { paths } from './schema'

export const apiClient = createClient<paths>({
  baseUrl: process.env.API_URL ?? 'http://localhost:5299',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
