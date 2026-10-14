export interface CloudflareRoute {
    hostname: string
    service: string
    appId: string | null
    appName: string | null
    managed: boolean
    dnsRecord: boolean
}

export interface DNSRecord {
    id: string
    name: string
    type: string
    content: string
    proxied: boolean
    managedByTunnel: boolean
}
