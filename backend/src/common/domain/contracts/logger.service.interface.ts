export interface LoggerServiceInterface {
    log: (message:string,...args: unknown[]) => void
    error: (message:string,...args: unknown[]) => void
    warn: (message:string,...args: unknown[]) => void
}