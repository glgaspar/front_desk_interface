"use client";

import React from 'react'
import { Pause, Play } from 'lucide-react';
import { JellyfinStream } from '../Interfaces';
import { NotIntegrated, useIntegrated, usePolling } from '../service';

const demo: JellyfinStream[] = [
  { user: 'gustavo', device: 'Living room TV', client: 'Jellyfin Android TV', title: 'S02E05 Ozymandias', series: 'Breaking Bad', type: 'Episode', paused: false, progress: 0.42 },
  { user: 'guest', device: 'Firefox', client: 'Jellyfin Web', title: 'Arrival', series: '', type: 'Movie', paused: true, progress: 0.8 },
];

export default function NowPlaying({enabled = false}: {enabled?: boolean}) {
  const integrated = useIntegrated('jellyfin', enabled);
  const { data, error } = usePolling<JellyfinStream[]>('/jellyfin/streams', enabled && integrated, 15000);
  const streams = enabled ? data || [] : demo;

  if (!integrated && enabled) return <NotIntegrated name="Jellyfin" />

  return (
    <div className="flex flex-col gap-3 w-full px-3 pb-3 text-xs">
      {error && <p className="text-center text-red-400">{error}</p>}
      {!error && streams.length === 0 && <p className="text-center text-gray-400 mt-4">Nobody is watching anything</p>}
      {streams.map((s, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="flex justify-between gap-2">
            <span className="flex items-center gap-1.5 min-w-0">
              {s.paused ? <Pause className="h-3 w-3 text-gray-500 shrink-0" /> : <Play className="h-3 w-3 text-emerald-400 shrink-0" />}
              <span className="truncate text-gray-200">{s.series ? `${s.series} ${s.title}` : s.title}</span>
            </span>
            <span className="text-gray-400 shrink-0">{s.user}</span>
          </div>
          <div className="w-full h-1 bg-gray-700 rounded overflow-hidden">
            <div className={`h-full rounded ${s.paused ? 'bg-gray-500' : 'bg-[#b3078b]'}`} style={{ width: `${s.progress * 100}%` }} />
          </div>
          <span className="text-[10px] text-gray-500 truncate">{s.device} · {s.client}</span>
        </div>
      ))}
    </div>
  )
}
