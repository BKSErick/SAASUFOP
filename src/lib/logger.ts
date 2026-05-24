const isDev = process.env.NODE_ENV === 'development'
const isServer = typeof window === 'undefined'

export function logError(context: string, error: unknown): void {
    if (isDev) {
        console.error(`[${context}]`, error)
        return
    }
    if (isServer) {
        const message = error instanceof Error ? error.message : String(error)
        process.stdout.write(JSON.stringify({ level: 'error', context, message, ts: new Date().toISOString() }) + '\n')
    }
    // client-side in production: silently swallow — user sees Toast instead
}

export function logWarn(context: string, message: string, data?: unknown): void {
    if (isDev) {
        console.warn(`[${context}]`, message, data ?? '')
        return
    }
    if (isServer) {
        process.stdout.write(JSON.stringify({ level: 'warn', context, message, data, ts: new Date().toISOString() }) + '\n')
    }
}

export function logInfo(context: string, message: string, data?: unknown): void {
    if (isDev) {
        console.info(`[${context}]`, message, data ?? '')
        return
    }
    if (isServer) {
        process.stdout.write(JSON.stringify({ level: 'info', context, message, data, ts: new Date().toISOString() }) + '\n')
    }
}
