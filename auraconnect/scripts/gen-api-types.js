#!/usr/bin/env node
const { execSync } = require('child_process')
const { readFileSync } = require('fs')
const { resolve } = require('path')

function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
      if (!(key in process.env)) process.env[key] = val
    }
  } catch { /* file not found — skip */ }
}

// .env.local takes precedence over .env
loadEnvFile(resolve(process.cwd(), '.env.local'))
loadEnvFile(resolve(process.cwd(), '.env'))

const apiUrl = (process.env.API_URL || 'http://localhost:5299').replace(/\/$/, '')
const output = 'src/lib/infrastructure/api/schema.d.ts'

console.log(`Fetching OpenAPI spec from ${apiUrl}/openapi/v1.json`)
execSync(
  `${resolve('node_modules/.bin/openapi-typescript')} ${apiUrl}/openapi/v1.json -o ${output}`,
  { stdio: 'inherit' }
)
