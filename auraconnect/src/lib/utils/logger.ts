type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = process.env.NODE_ENV !== 'production'

function ts() {
  return new Date().toISOString()
}

function formatCause(err: unknown, depth = 0): string {
  if (!err) return ''
  const indent = '  '.repeat(depth)
  if (err instanceof Error) {
    const lines = [`${indent}${err.name}: ${err.message}`]
    if (err.cause) lines.push(formatCause(err.cause, depth + 1))
    return lines.join('\n')
  }
  return `${indent}${String(err)}`
}

function write(level: LogLevel, context: string, message: string, meta?: Record<string, unknown>) {
  const prefix = `[${ts()}] [${level.toUpperCase()}] [${context}]`
  if (level === 'error') {
    const parts = [`${prefix} ${message}`]
    if (meta) {
      for (const [k, v] of Object.entries(meta)) {
        if (v instanceof Error) {
          parts.push(`  ${k}:\n${formatCause(v, 2)}`)
        } else if (v !== undefined) {
          parts.push(`  ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        }
      }
    }
    console.error(parts.join('\n'))
  } else if (level === 'warn') {
    console.warn(`${prefix} ${message}`, meta ? JSON.stringify(meta) : '')
  } else if (isDev || level === 'info') {
    console.log(`${prefix} ${message}`, meta ? JSON.stringify(meta) : '')
  }
}

export const logger = {
  debug: (ctx: string, msg: string, meta?: Record<string, unknown>) => write('debug', ctx, msg, meta),
  info:  (ctx: string, msg: string, meta?: Record<string, unknown>) => write('info', ctx, msg, meta),
  warn:  (ctx: string, msg: string, meta?: Record<string, unknown>) => write('warn', ctx, msg, meta),
  error: (ctx: string, msg: string, meta?: Record<string, unknown>) => write('error', ctx, msg, meta),
}
