export interface ProcessInfo {
    pid: number;
    name: string;
    memPercent?: number;
    cpuPercent?: number;
}

export interface SystemData {
    cpuPercent: number;
    memoryPercent: number;
    procMem: ProcessInfo[];
    procCPU: ProcessInfo[];
}
