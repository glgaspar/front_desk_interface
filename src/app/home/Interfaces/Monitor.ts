export interface ProcessInfo {
    pid: number;
    name: string;
    memPercent?: number;
    cpuPercent?: number;
}

export interface DiskInfo {
    path: string;
    total: number;
    used: number;
    usedPercent: number;
}

export interface SystemData {
    cpuPercent: number;
    memoryPercent: number;
    disks: DiskInfo[];
    procMem: ProcessInfo[];
    procCPU: ProcessInfo[];
}
