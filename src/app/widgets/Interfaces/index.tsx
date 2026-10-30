export interface ServerWidget {
    id: number
    name: string
    enabled: boolean
    position: number
    selected: boolean
}

export interface TransmissionTorrent {
    id?: number;
    name?: string;
    percentDone?: number;
    rateDownload?: number;
    rateUpload?: number;
    status?: number
}
export interface QbitTorrent {
    hash: string
    name: string
    progress: number
    dlspeed: number
    upspeed: number
    state: string
}

export interface TailscaleDevice {
    name: string
    os: string
    address: string
    online: boolean
    lastSeen: string
    updateAvailable: boolean
}

export interface TdarrStats {
    queue: number
    processed: number
    errored: number
    savedGB: number
    files: number
}

export interface JellyfinStream {
    user: string
    device: string
    client: string
    title: string
    series: string
    type: string
    paused: boolean
    progress: number
}

export interface PipelineItem {
    title: string
    source: string
    status: string
    progress: number
    timeLeft: string
    date: string
}

export interface MediaPipeline {
    requests: PipelineItem[]
    downloads: PipelineItem[]
    recent: PipelineItem[]
    errors: string[]
}

export interface DiskForecast {
    path: string
    usedPercent: number
    usedBytes: number
    totalBytes: number
    growthPerDay: number
    daysToFull: number | null
}

export interface ActivityEntry {
    id: number
    userName: string
    action: string
    target: string
    status: number | null
    createdAt: string
}

export interface SeerrPending {
    id: number
    title: string
    type: string
    requestedBy: string
    createdAt: string
}
