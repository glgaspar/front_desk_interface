"use client";

import React from 'react'
import { TdarrStats } from '../Interfaces';
import { NotIntegrated, useIntegrated, usePolling } from '../service';

const demo: TdarrStats = { queue: 12, processed: 840, errored: 3, savedGB: 412.7, files: 1290 };

function Stat({ label, value, color }: { label: string, value: string, color?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-md bg-zinc-900/60 border border-zinc-800">
      <span className="text-xl font-semibold font-mono" style={{ color }}>{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-gray-500">{label}</span>
    </div>
  )
}

// sizeDiff comes in GB, past 1000 its nicer in TB
function formatSaved(gb: number) {
  return Math.abs(gb) >= 1000 ? `${(gb / 1000).toFixed(2)} TB` : `${gb.toFixed(1)} GB`;
}

export default function Tdarr({enabled = false}: {enabled?: boolean}) {
  const integrated = useIntegrated('tdarr', enabled);
  const { data, error } = usePolling<TdarrStats>('/tdarr/stats', enabled && integrated);
  const stats = enabled ? data : demo;

  if (!integrated && enabled) return <NotIntegrated name="Tdarr" />
  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-2 w-full px-3 pb-3">
      <Stat label="Space saved" value={formatSaved(stats.savedGB)} color="#4ade80" />
      <Stat label="In queue" value={String(stats.queue)} color="#60a5fa" />
      <Stat label="Processed" value={String(stats.processed)} />
      <Stat label="Errors" value={String(stats.errored)} color={stats.errored > 0 ? "#f87171" : undefined} />
      <p className="col-span-2 text-center text-xs text-gray-500">{stats.files} files in the library</p>
    </div>
  )
}
