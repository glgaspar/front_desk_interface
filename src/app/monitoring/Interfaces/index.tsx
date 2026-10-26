export type Range = "1h" | "24h" | "7d" | "30d"

export interface Uptime {
    appKey: string
    appName: string
    uptimePercent: number
    up: boolean
    changedAt: string
    avgLatencyMs: number | null
    checks: number
}

export interface UptimePoint {
    time: string
    uptimePercent: number
    avgLatencyMs: number | null
}

export interface MetricPoint {
    time: string
    cpuPercent: number
    memPercent: number
    load1: number | null
    disks: Record<string, number>
}

export interface NotificationChannel {
    id: number
    name: string
    type: "ntfy" | "discord" | "telegram" | "webhook"
    config: Record<string, string>
    events: string[]
    enabled: boolean
}
