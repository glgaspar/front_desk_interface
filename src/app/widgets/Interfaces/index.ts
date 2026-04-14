interface ServerWidget {
    id: number
    name: string
    enabled: boolean
    position: number
    selected: boolean
}

interface TransmissionTorrent {
    id?: number;
    name?: string;
    percentDone?: number;
    rateDownload?: number;
    rateUpload?: number;
    status?: number
}