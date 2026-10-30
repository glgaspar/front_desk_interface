"use client";

import React from 'react'
import { PiholeTop as Top } from '../Interfaces';
import { NotIntegrated, useIntegrated, usePolling } from '../service';

const demo: Top = {
  total: 48210,
  blocked: 9120,
  percentBlocked: 18.9,
  domains: [
    { domain: 'telemetry.example.com', count: 2410 },
    { domain: 'ads.doubleclick.net', count: 1280 },
    { domain: 'app-measurement.com', count: 930 },
  ],
  clients: [
    { ip: '192.168.0.20', name: 'living-room-tv', count: 14200 },
    { ip: '192.168.0.31', name: 'phone', count: 9800 },
    { ip: '192.168.0.10', name: 'homeserver', count: 6100 },
  ],
};

function List({ title, rows }: { title: string, rows: { label: string, count: number }[] }) {
  const max = Math.max(1, ...rows.map(r => r.count));
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-gray-500">{title}</span>
      {rows.map(r => (
        <div key={r.label} className="relative flex justify-between gap-2 px-1 py-0.5 rounded overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-[#b3078b]/15" style={{ width: `${(r.count / max) * 100}%` }} />
          <span className="relative truncate text-gray-200" title={r.label}>{r.label}</span>
          <span className="relative font-mono text-gray-400 shrink-0">{r.count.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function PiholeTop({enabled = false}: {enabled?: boolean}) {
  const integrated = useIntegrated('pihole', enabled);
  const { data, error } = usePolling<Top>('/pihole/top', enabled && integrated, 300000);
  const top = enabled ? data : demo;

  if (enabled && !integrated) return <NotIntegrated name="Pi-hole" />
  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
  if (!top) return null;

  return (
    <div className="flex flex-col gap-3 w-full px-3 pb-3 text-xs">
      <p className="text-center text-gray-400">
        <span className="text-red-400 font-semibold">{top.percentBlocked.toFixed(1)}%</span> blocked today ({top.blocked.toLocaleString()} of {top.total.toLocaleString()} queries)
      </p>
      <List title="Most blocked" rows={top.domains.map(d => ({ label: d.domain, count: d.count }))} />
      <List title="Asks the most" rows={top.clients.map(c => ({ label: c.name || c.ip, count: c.count }))} />
    </div>
  )
}
