"use client";

import React from 'react'
import { CheckCircle2 } from 'lucide-react';
import { AttentionItem } from '../Interfaces';
import { Dot, usePolling } from '../service';

const demo: AttentionItem[] = [
  { severity: 'critical', kind: 'container', title: 'rackpad is exited', detail: 'exit code 1 network not found', link: '/' },
  { severity: 'warning', kind: 'disk', title: '/mnt/nas is filling up', detail: '87% used, full in ~23 days at this rate', link: '/monitoring' },
  { severity: 'warning', kind: 'updates', title: '4 updates available', detail: 'linuxserver/radarr:latest, rommapp/romm:latest...', link: '/' },
  { severity: 'warning', kind: 'seerr', title: '2 requests waiting for approval', detail: 'Dune: Part Two, Severance', link: '/widgets' },
];

// everything front desk knows that needs a human, in one list. empty when all is fine
export default function NeedsAttention({enabled = false}: {enabled?: boolean}) {
  const { data, error } = usePolling<AttentionItem[]>('/attention', enabled);
  const items = enabled ? data : demo;

  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
  if (!items) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-48 text-sm text-gray-400">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        Nothing needs you right now
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full px-3 pb-3 text-xs max-h-[28rem] overflow-y-auto">
      {items.map((item, i) => (
        <a key={i} href={item.link} className="flex items-start gap-2 p-1.5 rounded hover:bg-zinc-900 transition-colors">
          <span className="mt-1"><Dot critical={item.severity === 'critical'} /></span>
          <span className="flex flex-col min-w-0">
            <span className="text-gray-200">{item.title}</span>
            {item.detail && <span className="text-gray-500 truncate" title={item.detail}>{item.detail}</span>}
          </span>
        </a>
      ))}
    </div>
  )
}
