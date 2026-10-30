"use client";

import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { ArrowUpCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Api from '@/Components/Api';
import { useUser } from '@/Components/User';
import App, { UpdateStatus } from '@/app/home/Interfaces/Apps';
import { confirmStreams } from '@/app/home/Components/Apps/confirmStreams';
import { usePolling } from '../service';

const demo = [
  { id: 'demo1', name: 'radarr', imageRef: 'linuxserver/radarr:latest' },
  { id: 'demo2', name: 'romm', imageRef: 'rommapp/romm:latest' },
  { id: 'demo3', name: 'affine', imageRef: 'ghcr.io/toeverything/affine:stable' },
] as App[];

function Row({ app, mock }: { app: App, mock: boolean }) {
  const { isAdmin } = useUser();
  const [updating, setUpdating] = useState(false);

  async function update() {
    if (mock) return toast("This is just demo data");
    if (!await confirmStreams(app, "Update")) return;
    setUpdating(true);
    Api().post(`/apps/update/${app.id}`)
      .then(() => toast.success(`Updating ${app.name}, follow the build on the home page`))
      .catch(error => {
        toast.error(error?.response?.data?.message || "Could not update it");
        setUpdating(false);
      });
  }

  return (
    <div className="flex items-center justify-between gap-2 p-1 rounded hover:bg-zinc-900/60">
      <span className="flex flex-col min-w-0">
        <span className="truncate text-gray-200">{app.name || app.imageRef}</span>
        <span className="truncate font-mono text-[10px] text-gray-500">{app.imageRef}</span>
      </span>
      {isAdmin && (
        <button type="button" onClick={update} disabled={updating} className="flex items-center gap-1 px-2 py-1 rounded text-amber-400 hover:bg-zinc-800 cursor-pointer disabled:opacity-60 shrink-0">
          {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpCircle className="h-4 w-4" />}
          {updating ? "building" : "update"}
        </button>
      )}
    </div>
  )
}

// the api caches the checks, so asking every 10 minutes costs nothing on docker hub
export default function Updates({enabled = false}: {enabled?: boolean}) {
  const updates = usePolling<Record<string, UpdateStatus>>('/apps/updates', enabled, 600000);
  const apps = usePolling<App[]>('/apps', enabled, 600000);

  const outdated = enabled
    ? (apps.data || []).filter(app => app.imageRef && updates.data?.[app.imageRef]?.status === 'update_available')
    : demo;
  const error = updates.error || apps.error;

  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
  if (enabled && (!updates.data || !apps.data)) return null;

  if (outdated.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-48 text-sm text-gray-400">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        Everything is up to date
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 w-full px-3 pb-3 text-xs max-h-[28rem] overflow-y-auto">
      <p className="text-center text-gray-400 mb-1">{outdated.length} apps have a newer image</p>
      {outdated.map(app => <Row key={app.id} app={app} mock={!enabled} />)}
    </div>
  )
}
