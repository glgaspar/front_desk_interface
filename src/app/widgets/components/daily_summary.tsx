"use client";

import React, { useEffect, useState } from 'react'
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import Api from '@/Components/Api';
import { DailySummary as Summary } from '../Interfaces';
import { NotIntegrated, timeAgo, useIntegrated, usePolling } from '../service';

const demo: Summary = {
  text: "rackpad has been down since yesterday afternoon because its docker network no longer exists, recreating it should fix it. Everything else stayed up all day. /mnt/nas grew 22 GB and will be full in about three weeks at this rate. Four images have updates waiting, radarr and romm among them.",
  generatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  generating: false,
  error: '',
};

// ollama writes it in the background on the api, which keeps it for 6 hours.
// while it is writing the widget asks more often
export default function DailySummary({enabled = false}: {enabled?: boolean}) {
  const integrated = useIntegrated('ollama', enabled);
  const [generating, setGenerating] = useState(false);
  const { data, error, reload } = usePolling<Summary>('/monitoring/summary', enabled && integrated, generating ? 15000 : 1800000);
  const summary = enabled ? data : demo;

  useEffect(() => {
    setGenerating(!!data?.generating);
  }, [data]);

  function refresh() {
    if (!enabled) return;
    // the api ignores this if the last one is less than 10 minutes old
    Api().get('/monitoring/summary?refresh=true').finally(reload);
  }

  if (enabled && !integrated) return <NotIntegrated name="Ollama" />
  if (error || summary?.error) return <p className="text-center text-sm text-red-400 p-4">{error || summary?.error}</p>
  if (!summary?.text) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-48 text-sm text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin text-[#e04fbf]" />
        ollama is writing it, this can take a minute
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full px-4 pb-3 text-sm">
      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{summary.text}</p>
      <div className="flex justify-between items-center text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-[#e04fbf]" />written {timeAgo(summary.generatedAt)}</span>
        <button type="button" onClick={refresh} disabled={summary.generating} className="flex items-center gap-1 hover:text-[#e04fbf] cursor-pointer disabled:opacity-60" title="Write it again">
          <RefreshCw className={`h-3 w-3 ${summary.generating ? 'animate-spin' : ''}`} />{summary.generating ? 'writing' : 'again'}
        </button>
      </div>
    </div>
  )
}
