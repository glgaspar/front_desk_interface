"use client";

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { CheckCircle2, Trash2 } from 'lucide-react';
import Api from '@/Components/Api';
import { useUser } from '@/Components/User';
import App from '@/app/home/Interfaces/Apps';
import { CloudflareRoute, DNSRecord } from '@/app/cloudflare/Interfaces';
import { Dot, NotIntegrated, useIntegrated } from '../service';

interface Problem {
  hostname: string
  reason: string
  critical: boolean
}

const demo: Problem[] = [
  { hostname: 'oldapp.pessimaideia.com', reason: 'the app was deleted', critical: true },
  { hostname: 'rackpad.pessimaideia.com', reason: 'rackpad is exited', critical: false },
  { hostname: 'test.pessimaideia.com', reason: 'dns record with no tunnel route', critical: false },
];

// same rules as the cloudflare page, just only the bad ones
function findProblems(routes: CloudflareRoute[], records: DNSRecord[], apps: App[]): Problem[] {
  const problems: Problem[] = [];
  for (const route of routes) {
    const app = apps.find(a => a.id === route.appId);
    if (route.managed && !route.appId) {
      problems.push({ hostname: route.hostname, reason: 'the app was deleted', critical: true });
    } else if (app && app.state?.status !== 'running') {
      problems.push({ hostname: route.hostname, reason: `${app.name} is ${app.state?.status}`, critical: false });
    }
  }
  const routed = routes.map(r => r.hostname);
  for (const record of records) {
    if (record.managedByTunnel && !routed.includes(record.name)) {
      problems.push({ hostname: record.name, reason: 'dns record with no tunnel route', critical: false });
    }
  }
  return problems;
}

export default function CloudflareCleanup({enabled = false}: {enabled?: boolean}) {
  const { isAdmin } = useUser();
  const integrated = useIntegrated('cloudflare', enabled, '/cloudflare/config');
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!enabled || !integrated) return;
    Promise.all([Api().get('/cloudflare/routes'), Api().get('/cloudflare/dns'), Api().get('/apps')])
      .then(([routes, dns, apps]) => {
        setProblems(findProblems(routes?.data?.data || [], dns?.data?.data || [], apps?.data?.data || []));
        setError('');
      })
      .catch(err => setError(err?.response?.data?.message || 'Could not talk to cloudflare'));
  }, [enabled, integrated, refresh]);

  function remove(problem: Problem) {
    if (!enabled) return toast("This is just demo data");
    if (!confirm(`Remove ${problem.hostname} from the tunnel and its dns record?`)) return;
    const removing = toast.loading('Removing ' + problem.hostname + '...');
    Api().delete(`/cloudflare/hostname/${encodeURIComponent(problem.hostname)}?dns=true`)
      .then(() => toast.success(problem.hostname + ' removed'))
      .catch(err => toast.error(err?.response?.data?.message || 'Could not remove it'))
      .finally(() => {
        toast.dismiss(removing);
        setRefresh(prev => prev + 1);
      });
  }

  if (enabled && !integrated) return <NotIntegrated name="Cloudflare" />
  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>

  const list = enabled ? problems : demo;
  if (!list) return null;

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-48 text-sm text-gray-400">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        Every tunnel route goes somewhere
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 w-full px-3 pb-3 text-xs max-h-[28rem] overflow-y-auto">
      {list.map(p => (
        <div key={p.hostname + p.reason} className="flex items-center justify-between gap-2 p-1 rounded hover:bg-zinc-900/60">
          <span className="flex items-center gap-2 min-w-0">
            <Dot critical={p.critical} />
            <span className="flex flex-col min-w-0">
              <span className="truncate text-gray-200">{p.hostname}</span>
              <span className="text-gray-500">{p.reason}</span>
            </span>
          </span>
          {isAdmin && (
            <button type="button" onClick={() => remove(p)} className="p-1 rounded text-red-500 hover:text-red-400 hover:bg-zinc-800 cursor-pointer shrink-0" title="Remove">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
