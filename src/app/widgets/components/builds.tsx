"use client";

import React, { useEffect, useState } from 'react'
import { Hammer } from 'lucide-react';
import { EventConsumer } from '@/Components/Api';
import { usePolling } from '../service';

// each build gets its own stream, only the last line is kept. same stream the building card uses
function BuildLine({ app }: { app: string }) {
  const [line, setLine] = useState('waiting for output...');

  useEffect(() => {
    const events = EventConsumer('/apps/waitingBuilds/' + encodeURIComponent(app));
    events.onmessage = event => {
      if (event.data) setLine(event.data);
      if (event.data?.includes('stream closed') || event.data?.includes('no active build')) events.close();
    };
    events.onerror = () => events.close();
    return () => events.close();
  }, [app]);

  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-2 text-gray-200">
        <Hammer className="h-3 w-3 text-[#e04fbf] animate-pulse" />{app}
      </span>
      <span className="font-mono text-[10px] text-gray-500 truncate" title={line}>{line}</span>
    </div>
  )
}

export default function Builds({enabled = false}: {enabled?: boolean}) {
  const { data, error } = usePolling<string[]>('/apps/waitingBuilds', enabled, 10000);

  if (!enabled) {
    return (
      <div className="flex flex-col gap-3 w-full px-3 pb-3 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-2 text-gray-200"><Hammer className="h-3 w-3 text-[#e04fbf] animate-pulse" />timetracker</span>
          <span className="font-mono text-[10px] text-gray-500 truncate">#8 [build 4/6] RUN go build -o /app/server .</span>
        </div>
      </div>
    )
  }

  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
  if (!data) return null;
  if (data.length === 0) return <p className="text-center text-sm text-gray-400 p-4">Nothing building</p>

  return (
    <div className="flex flex-col gap-3 w-full px-3 pb-3 text-xs">
      {data.map(app => <BuildLine key={app} app={app} />)}
    </div>
  )
}
