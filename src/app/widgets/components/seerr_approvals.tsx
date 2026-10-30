"use client";

import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { Check, CheckCircle2, Film, Tv, X } from 'lucide-react';
import Api from '@/Components/Api';
import { useUser } from '@/Components/User';
import { SeerrPending } from '../Interfaces';
import { NotIntegrated, timeAgo, useIntegrated, usePolling } from '../service';

const demo: SeerrPending[] = [
  { id: 1, title: 'Dune: Part Two', type: 'movie', requestedBy: 'guest', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 2, title: 'Severance', type: 'tv', requestedBy: 'mom', createdAt: new Date(Date.now() - 30 * 3600000).toISOString() },
];

export default function SeerrApprovals({enabled = false}: {enabled?: boolean}) {
  const { isAdmin } = useUser();
  const integrated = useIntegrated('seerr', enabled);
  const { data, error, reload } = usePolling<SeerrPending[]>('/seerr/pending', enabled && integrated);
  const [answering, setAnswering] = useState(0);
  const requests = enabled ? data : demo;

  function answer(request: SeerrPending, action: 'approve' | 'decline') {
    if (!enabled) return toast("This is just demo data");
    setAnswering(request.id);
    Api().post(`/seerr/requests/${request.id}/${action}`)
      .then(() => toast.success(`${request.title} ${action === 'approve' ? 'approved' : 'declined'}`))
      .catch(err => toast.error(err?.response?.data?.message || `Could not ${action} it`))
      .finally(() => {
        setAnswering(0);
        reload();
      });
  }

  if (enabled && !integrated) return <NotIntegrated name="Seerr" />
  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
  if (!requests) return null;

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-48 text-sm text-gray-400">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        No requests waiting
      </div>
    )
  }

  const button = "p-1 rounded hover:bg-zinc-800 cursor-pointer disabled:opacity-50";

  return (
    <div className="flex flex-col gap-1 w-full px-3 pb-3 text-xs max-h-[28rem] overflow-y-auto">
      {requests.map(r => (
        <div key={r.id} className="flex items-center justify-between gap-2 p-1 rounded hover:bg-zinc-900/60">
          <span className="flex items-center gap-2 min-w-0">
            {r.type === 'tv' ? <Tv className="h-4 w-4 text-gray-500 shrink-0" /> : <Film className="h-4 w-4 text-gray-500 shrink-0" />}
            <span className="flex flex-col min-w-0">
              <span className="truncate text-gray-200">{r.title}</span>
              <span className="text-gray-500">{r.requestedBy} · {timeAgo(r.createdAt)}</span>
            </span>
          </span>
          {isAdmin && (
            <span className="flex gap-1 shrink-0">
              <button type="button" disabled={answering === r.id} onClick={() => answer(r, 'approve')} className={`${button} text-emerald-400`} title="Approve">
                <Check className="h-4 w-4" />
              </button>
              <button type="button" disabled={answering === r.id} onClick={() => answer(r, 'decline')} className={`${button} text-red-400`} title="Decline">
                <X className="h-4 w-4" />
              </button>
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
