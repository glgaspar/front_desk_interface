"use client";

import React from 'react'
import { CheckCircle2, CircleDot, GitPullRequest } from 'lucide-react';
import { defineWidget, useWidgetApi } from '../sdk';
import { timeAgo } from '../service';

// a widget with no official support: no api code was written for it. it says what it needs here,
// an admin fills it in Configure, and the api makes the calls with it. WIDGETS.md explains all of it
export const config = defineWidget({
  fields: {
    url: { label: 'Gitea url', placeholder: 'https://git.pessimaideia.com' },
    token: { label: 'Access token (read:issue and read:repository)', secret: true },
  },
  auth: { headers: { Authorization: 'token {token}' } },
  allow: [{ method: 'GET', path: '/api/v1/repos/issues/search' }],
});

interface Issue {
  id: number
  number: number
  title: string
  html_url: string
  updated_at: string
  pull_request: object | null
  repository: { name: string, full_name: string }
  user: { login: string }
}

const hour = 3600000;
const demo: Issue[] = [
  { id: 1, number: 12, title: 'pihole v6', html_url: '#', updated_at: new Date(Date.now() - 2 * hour).toISOString(), pull_request: {}, repository: { name: 'front_desk', full_name: 'gustavo/front_desk' }, user: { login: 'gustavo' } },
  { id: 2, number: 4, title: 'export csv', html_url: '#', updated_at: new Date(Date.now() - 26 * hour).toISOString(), pull_request: {}, repository: { name: 'timetracker', full_name: 'gustavo/timetracker' }, user: { login: 'gustavo' } },
  { id: 3, number: 9, title: 'crash on .7z files', html_url: '#', updated_at: new Date(Date.now() - 74 * hour).toISOString(), pull_request: null, repository: { name: 'retroRom', full_name: 'gustavo/retroRom' }, user: { login: 'someone' } },
];

// open pull requests and issues from every repo the token can see, last touched first
export default function Gitea({enabled = false}: {enabled?: boolean}) {
  const { data, error } = useWidgetApi<Issue[]>('/api/v1/repos/issues/search?state=open&limit=20', { interval: 300000 });
  const items = enabled ? data : demo;

  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
  if (!items) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-48 text-sm text-gray-400">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        Nothing open
      </div>
    )
  }

  const sorted = [...items].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  const pulls = items.filter(i => i.pull_request).length;

  return (
    <div className="flex flex-col gap-1 w-full px-3 pb-3 text-xs max-h-[28rem] overflow-y-auto">
      <p className="text-center text-gray-400 mb-1">{pulls} pull requests and {items.length - pulls} issues open</p>
      {sorted.map(issue => (
        <a key={issue.id} href={issue.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 p-1 rounded hover:bg-zinc-900">
          <span className="flex items-center gap-2 min-w-0">
            {issue.pull_request
              ? <GitPullRequest className="h-4 w-4 text-[#e04fbf] shrink-0" />
              : <CircleDot className="h-4 w-4 text-emerald-400 shrink-0" />}
            <span className="flex flex-col min-w-0">
              <span className="truncate text-gray-200">{issue.title}</span>
              <span className="text-gray-500 truncate">{issue.repository.name} #{issue.number} · {issue.user.login}</span>
            </span>
          </span>
          <span className="text-gray-500 shrink-0">{timeAgo(issue.updated_at)}</span>
        </a>
      ))}
    </div>
  )
}
