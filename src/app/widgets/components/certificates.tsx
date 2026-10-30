"use client";

import React from 'react'
import { Lock } from 'lucide-react';
import { NPMCertificate } from '@/app/proxy/Interfaces';
import { Dot, NotIntegrated, daysUntil, useIntegrated, usePolling } from '../service';

const demo: NPMCertificate[] = [
  { id: 1, nice_name: '*.pessimaideia.com', provider: 'letsencrypt', domain_names: ['*.pessimaideia.com'], expires_on: new Date(Date.now() + 2 * 86400000).toISOString() },
  { id: 2, nice_name: 'pessimaideia.com', provider: 'letsencrypt', domain_names: ['pessimaideia.com'], expires_on: new Date(Date.now() + 9 * 86400000).toISOString() },
  { id: 3, nice_name: 'old.example.com', provider: 'other', domain_names: ['old.example.com'], expires_on: new Date(Date.now() + 80 * 86400000).toISOString() },
];

// npm renews on its own around 30 days before. anything closer than that means it didnt
const SOON = 30;

export default function Certificates({enabled = false}: {enabled?: boolean}) {
  const integrated = useIntegrated('nginxproxymanager', enabled, '/npm/config');
  const { data, error } = usePolling<NPMCertificate[]>('/npm/certificates', enabled && integrated, 3600000);
  const certs = enabled ? data : demo;

  if (enabled && !integrated) return <NotIntegrated name="Nginx Proxy Manager" />
  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
  if (!certs) return null;

  const sorted = [...certs].sort((a, b) => daysUntil(a.expires_on) - daysUntil(b.expires_on));
  const soon = sorted.filter(c => daysUntil(c.expires_on) < SOON);
  const fine = sorted.length - soon.length;

  return (
    <div className="flex flex-col gap-2 w-full px-3 pb-3 text-xs">
      {soon.map(cert => {
        const days = daysUntil(cert.expires_on);
        return (
          <a key={cert.id} href="/proxy" className="flex items-center justify-between gap-2 p-1 rounded hover:bg-zinc-900">
            <span className="flex items-center gap-2 min-w-0">
              <Dot critical={days < 7} />
              <span className="truncate text-gray-200" title={cert.domain_names.join(', ')}>{cert.nice_name || cert.domain_names.join(', ')}</span>
            </span>
            <span className={`shrink-0 font-mono ${days < 7 ? 'text-red-400' : 'text-amber-400'}`}>
              {days < 0 ? 'expired' : `${Math.floor(days)}d left`}
            </span>
          </a>
        )
      })}
      <p className="flex items-center justify-center gap-1.5 text-gray-400 mt-1">
        <Lock className="h-3 w-3 text-emerald-400" />
        {soon.length === 0 ? `All ${fine} certificates are good for more than ${SOON} days` : `${fine} more are fine`}
      </p>
    </div>
  )
}
