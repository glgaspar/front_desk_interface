"use client";

import React from 'react'
import { useUser } from '@/Components/User';
import { ActivityEntry } from '../Interfaces';
import { timeAgo, usePolling } from '../service';

const demo = [
  { id: 3, userName: 'gustavo', action: 'updated app', target: 'radarr', status: 200, createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: 2, userName: 'gustavo', action: 'added proxy host', target: 'kavita.pessimaideia.com', status: 200, createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 1, userName: 'guest', action: 'logged in', target: '', status: 200, createdAt: new Date(Date.now() - 26 * 3600000).toISOString() },
] as ActivityEntry[];

// the api already filters it: admins see everybody, everyone else only themselves
export default function RecentActivity({enabled = false}: {enabled?: boolean}) {
  const { isAdmin } = useUser();
  const { data, error } = usePolling<ActivityEntry[]>('/activity?limit=10', enabled);
  const entries = enabled ? data : demo;

  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
  if (!entries) return null;
  if (entries.length === 0) return <p className="text-center text-sm text-gray-400 p-4">Nothing happened yet</p>

  return (
    <div className="flex flex-col gap-1.5 w-full px-3 pb-3 text-xs">
      {entries.map(e => (
        <div key={e.id} className="flex justify-between gap-2">
          <span className="truncate min-w-0" title={e.target}>
            {isAdmin && <span className="text-[#e04fbf]">{e.userName} </span>}
            <span className={e.status && e.status >= 400 ? 'text-red-400' : 'text-gray-200'}>{e.action}</span>
            {e.target && <span className="text-gray-500"> {e.target}</span>}
          </span>
          <span className="text-gray-500 shrink-0">{timeAgo(e.createdAt)}</span>
        </div>
      ))}
      <a href="/activity" className="self-center mt-1 text-gray-500 hover:text-[#e04fbf] underline">see everything</a>
    </div>
  )
}
