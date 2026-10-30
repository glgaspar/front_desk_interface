"use client";

import React from 'react'
import { TailscaleDevice } from '../Interfaces';
import { NotIntegrated, useIntegrated, usePolling } from '../service';
import { maskDateTime } from '@/Utils/maskDatetime';

const demo: TailscaleDevice[] = [
  { name: 'homeserver', os: 'linux', address: '100.64.0.1', online: true, lastSeen: new Date().toISOString(), updateAvailable: false },
  { name: 'phone', os: 'android', address: '100.64.0.2', online: true, lastSeen: new Date().toISOString(), updateAvailable: true },
  { name: 'old-laptop', os: 'windows', address: '100.64.0.3', online: false, lastSeen: '2026-09-01T12:00:00Z', updateAvailable: false },
];

export default function Tailscale({enabled = false}: {enabled?: boolean}) {
  const integrated = useIntegrated('tailscale', enabled);
  const { data, error } = usePolling<TailscaleDevice[]>('/tailscale/devices', enabled && integrated);
  const devices = enabled ? data || [] : demo;
  const online = devices.filter(d => d.online).length;

  if (!integrated && enabled) return <NotIntegrated name="Tailscale" />

  return (
    <div className="flex flex-col gap-2 w-full px-3 pb-3 text-xs">
      {error
        ? <p className="text-center text-red-400">{error}</p>
        : <p className="text-center text-gray-400">{online} of {devices.length} devices online</p>}
      <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto">
        {devices.map(d => (
          <div key={d.name + d.address} className="flex justify-between items-center gap-2">
            <span className="flex items-center gap-2 min-w-0">
              <span className={`h-2 w-2 rounded-full shrink-0 ${d.online ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
              <span className="truncate">{d.name}</span>
              <span className="text-gray-500 shrink-0">{d.os}</span>
              {d.updateAvailable && <span className="px-1 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">update</span>}
            </span>
            <span className="font-mono text-gray-400 shrink-0" title={d.online ? '' : 'last seen ' + maskDateTime(d.lastSeen)}>
              {d.online ? d.address : maskDateTime(d.lastSeen)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
