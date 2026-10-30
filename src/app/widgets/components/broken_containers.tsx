"use client";

import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { CheckCircle2, Loader2, Play, Sparkles } from 'lucide-react';
import Api from '@/Components/Api';
import { useUser } from '@/Components/User';
import App from '@/app/home/Interfaces/Apps';
import { Dot, useIntegrated, usePolling } from '../service';

const demo = [
  { id: 'demo1', name: 'rackpad', imageRef: 'ghcr.io/kobii-git/rackpad:latest', state: { status: 'exited', exitCode: 1, error: 'failed to set up container networking: network 5dc3 not found' } },
  { id: 'demo2', name: 'worker', imageRef: 'some/worker:latest', state: { status: 'restarting', exitCode: 137, error: '' } },
] as App[];

// same rule as the api: stopped on its own. exit code 0 is something that was meant to run once
function broken(app: App) {
  const s = app.state?.status;
  return s === 'restarting' || s === 'dead' || (s === 'exited' && app.state.exitCode !== 0);
}

function Row({ app, mock, ollama, reload }: { app: App, mock: boolean, ollama: boolean, reload: () => void }) {
  const { isAdmin } = useUser();
  const [busy, setBusy] = useState("");
  const [explanation, setExplanation] = useState("");

  function start() {
    if (mock) return toast("This is just demo data");
    setBusy("start");
    // the api recreates it by itself when the network is gone
    Api().put(`/apps/toggleOnOff/${app.id}/start`)
      .then(() => toast.success(app.name + " started"))
      .catch(error => toast.error(error?.response?.data?.message || "Could not start it"))
      .finally(() => {
        setBusy("");
        reload();
      });
  }

  function explain() {
    if (mock) return toast("This is just demo data");
    setBusy("explain");
    Api().post(`/apps/explain/${app.id}`)
      .then(res => setExplanation(res?.data?.data || "Ollama had nothing to say"))
      .catch(error => setExplanation(error?.response?.data?.message || "Could not ask ollama"))
      .finally(() => setBusy(""));
  }

  const button = "p-1 rounded text-gray-400 hover:text-[#e04fbf] hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50";

  return (
    <div className="flex flex-col gap-1 p-1.5 rounded hover:bg-zinc-900/60">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 min-w-0">
          <Dot critical={app.state.status !== 'restarting'} />
          <span className="truncate text-gray-200" title={app.imageRef}>{app.name || app.imageRef}</span>
          <span className="text-gray-500 shrink-0">{app.state.status} ({app.state.exitCode})</span>
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {ollama && (
            <button type="button" onClick={explain} disabled={!!busy} className={button} title="Ask ollama what happened">
              {busy === "explain" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            </button>
          )}
          {isAdmin && (
            <button type="button" onClick={start} disabled={!!busy} className={button} title="Start">
              {busy === "start" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            </button>
          )}
        </span>
      </div>
      {app.state.error && <span className="text-red-400/80 font-mono text-[10px] break-all">{app.state.error}</span>}
      {explanation && <p className="text-gray-300 whitespace-pre-wrap border-l-2 border-[#b3078b]/60 pl-2">{explanation}</p>}
    </div>
  )
}

// unlike uptime this looks at docker, so it catches the containers that have no url to check
export default function BrokenContainers({enabled = false}: {enabled?: boolean}) {
  const ollama = useIntegrated('ollama', true);
  const { data, error, reload } = usePolling<App[]>('/apps', enabled, 30000);
  const apps = enabled ? (data || []).filter(broken) : demo;

  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
  if (enabled && !data) return null;

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-48 text-sm text-gray-400">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        No container died on its own
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 w-full px-3 pb-3 text-xs max-h-[28rem] overflow-y-auto">
      {apps.map(app => <Row key={app.id} app={app} mock={!enabled} ollama={ollama} reload={reload} />)}
    </div>
  )
}
