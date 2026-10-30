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
