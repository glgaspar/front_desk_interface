interface ProcessInfo {
    pid: number;
    name: string;
    memPercent?: number;
    cpuPercent?: number;
}

interface SystemData {
    cpuPercent: number;
    memoryPercent: number;
    procMem: ProcessInfo[];
    procCPU: ProcessInfo[];
}
