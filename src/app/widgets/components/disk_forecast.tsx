"use client";

import React from 'react'
import ProgressBar from '@/Components/ProgressBar';
import { getUsageColor } from '@/Utils/usageColor';
import { DiskForecast as Forecast } from '../Interfaces';
import { formatBytes } from '../TorrentItem';
import { usePolling } from '../service';

const GB = 1024 ** 3;
const demo: Forecast[] = [
  { path: '/', usedPercent: 41, usedBytes: 190 * GB, totalBytes: 460 * GB, growthPerDay: 0.2 * GB, daysToFull: 1350 },
  { path: '/mnt/nas', usedPercent: 87, usedBytes: 3480 * GB, totalBytes: 4000 * GB, growthPerDay: 22 * GB, daysToFull: 23.6 },
  { path: '/mnt/backup', usedPercent: 60, usedBytes: 600 * GB, totalBytes: 1000 * GB, growthPerDay: -1 * GB, daysToFull: null },
];

function when(days: number | null) {
  if (days === null) return 'not growing';
  if (days > 365) return 'over a year';
  if (days > 60) return `~${Math.round(days / 30)} months`;
  return `~${Math.round(days)} days`;
}

// a straight line over the last 7 days, the api does the math
export default function DiskForecast({enabled = false}: {enabled?: boolean}) {
  const { data, error } = usePolling<Forecast[]>('/monitoring/disks/forecast', enabled, 600000);
  const disks = enabled ? data : demo;

  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
  if (!disks) return null;
  if (disks.length === 0) return <p className="text-center text-sm text-gray-400 p-4">No disk samples yet</p>

  return (
    <div className="flex flex-col gap-3 w-full px-3 pb-3 text-xs">
      {disks.map(d => {
        const urgent = d.daysToFull !== null && d.daysToFull < 30;
        return (
          <div key={d.path} className="flex flex-col gap-1">
            <div className="flex justify-between gap-2">
              <span className="font-mono truncate text-gray-200">{d.path}</span>
              <span className="text-gray-400 shrink-0">{formatBytes(d.usedBytes)} / {formatBytes(d.totalBytes)}</span>
            </div>
            <ProgressBar percentage={d.usedPercent} color={getUsageColor(d.usedPercent)} className="h-1.5" />
            <div className="flex justify-between gap-2 text-[10px]">
              <span className="text-gray-500">{d.growthPerDay >= 0 ? '+' : ''}{formatBytes(d.growthPerDay)}/day</span>
              <span className={urgent ? 'text-red-400' : 'text-gray-400'}>full in {when(d.daysToFull)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
