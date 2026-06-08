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

function formatValue(v: unknown): string {
  if (v instanceof Error) return formatCause(v, 1)
  if (typeof v === 'string') {
    // pretty-print JSON strings (e.g. ASP.NET ProblemDetails bodies)
    try { return JSON.stringify(JSON.parse(v), null, 2) } catch { return v }
  }
  if (typeof v === 'object' && v !== null) return JSON.stringify(v, null, 2)
  return String(v)
}

function formatMeta(meta: Record<string, unknown>): string {
  return Object.entries(meta)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `  ${k}: ${formatValue(v)}`)
    .join('\n')
}

function write(level: LogLevel, context: string, message: string, meta?: Record<string, unknown>) {
  const prefix = `[${ts()}] [${level.toUpperCase()}] [${context}]`
  const metaStr = meta ? '\n' + formatMeta(meta) : ''
  if (level === 'error') {
    console.error(`${prefix} ${message}${metaStr}`)
  } else if (level === 'warn') {
    console.warn(`${prefix} ${message}${metaStr}`)
  } else if (isDev || level === 'info') {
    console.log(`${prefix} ${message}${metaStr}`)
  }
}

export const logger = {
  debug: (ctx: string, msg: string, meta?: Record<string, unknown>) => write('debug', ctx, msg, meta),
  info:  (ctx: string, msg: string, meta?: Record<string, unknown>) => write('info', ctx, msg, meta),
  warn:  (ctx: string, msg: string, meta?: Record<string, unknown>) => write('warn', ctx, msg, meta),
  error: (ctx: string, msg: string, meta?: Record<string, unknown>) => write('error', ctx, msg, meta),
}
