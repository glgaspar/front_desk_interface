export interface NPMConfig {
    url: string
    email: string
    password?: string
    forwardHost: string
    defaultCertificateId: number
    passwordSet?: boolean
}

export interface NPMCertificate {
    id: number
    nice_name: string
    provider: string
    domain_names: string[]
    expires_on: string
}

export interface NPMHost {
    id: number
    domain_names: string[]
    forward_scheme: string
    forward_host: string
    forward_port: number
    certificate_id: number
    ssl_forced: boolean
    enabled: boolean
    appId: string | null
    appName: string | null
    managed: boolean
}

export function certificateLabel(cert: NPMCertificate) {
    const name = cert.nice_name || cert.domain_names?.join(", ") || `#${cert.id}`
    const expires = cert.expires_on ? ` (until ${new Date(cert.expires_on).toLocaleDateString()})` : ""
    return name + expires
}
