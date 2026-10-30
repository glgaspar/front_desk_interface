"use client";

import React, { useState } from 'react'
import { AppStats } from '@/app/home/Interfaces/Apps';
import ProgressBar from '@/Components/ProgressBar';
import { getUsageColor } from '@/Utils/usageColor';
import { usePolling } from '../service';

const demo = [
  { id: '1', name: 'jellyfin', cpuPercent: 182.4, memPercent: 9.1, memUsage: '1.4GiB / 15.5GiB' },
  { id: '2', name: 'tdarr', cpuPercent: 96.2, memPercent: 4.8, memUsage: '760MiB / 15.5GiB' },
  { id: '3', name: 'ollama', cpuPercent: 3.1, memPercent: 31.2, memUsage: '4.8GiB / 15.5GiB' },
  { id: '4', name: 'affine', cpuPercent: 1.2, memPercent: 6.3, memUsage: '1GiB / 15.5GiB' },
  { id: '5', name: 'qbittorrent', cpuPercent: 8.7, memPercent: 2.2, memUsage: '350MiB / 15.5GiB' },
] as AppStats[];

// docker cpu is per core, 200% means two whole cores. the bar is capped, the number is not
export default function TopConsumers({enabled = false}: {enabled?: boolean}) {
  const [by, setBy] = useState<'cpu' | 'mem'>('cpu');
  const { data, error } = usePolling<AppStats[]>('/apps/stats', enabled, 15000);
  const stats = enabled ? data : demo;

  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
  if (!stats) return null;

  const value = (s: AppStats) => by === 'cpu' ? s.cpuPercent : s.memPercent;
  const top = [...stats].sort((a, b) => value(b) - value(a)).slice(0, 5);
  const tab = (key: 'cpu' | 'mem', label: string) => (
    <button type="button" onClick={() => setBy(key)} className={`px-2 py-0.5 rounded cursor-pointer ${by === key ? 'bg-[#b3078b] text-white' : 'text-gray-400 hover:text-white'}`}>{label}</button>
  );

  return (
    <div className="flex flex-col gap-3 w-full px-3 pb-3 text-xs">
      <div className="flex justify-center gap-1">{tab('cpu', 'CPU')}{tab('mem', 'Memory')}</div>
      {top.map(s => (
        <div key={s.id} className="flex flex-col gap-1">
          <div className="flex justify-between gap-2">
            <span className="truncate text-gray-200">{s.name}</span>
            <span className="font-mono text-gray-400 shrink-0">{by === 'cpu' ? `${s.cpuPercent.toFixed(1)}%` : s.memUsage.split(' / ')[0]}</span>
          </div>
          <ProgressBar percentage={Math.min(100, value(s))} color={getUsageColor(value(s))} className="h-1.5" />
        </div>
      ))}
    </div>
  )
}
