import React from 'react'
import { Activity, Cpu, HardDrive, RefreshCw } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground text-sm">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading...
        </div>
    </div>
  )
}
