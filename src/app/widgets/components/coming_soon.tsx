"use client";

import React from 'react'
import { MediaPipeline, PipelineItem } from '../Interfaces';
import { timeAgo, usePolling } from '../service';

const demo: MediaPipeline = {
  requests: [{ title: 'Dune: Part Two', source: 'seerr', status: 'waiting approval', progress: 0, timeLeft: '', date: '' }],
  downloads: [
    { title: 'Severance S02E03', source: 'sonarr', status: 'downloading', progress: 0.64, timeLeft: '00:12:40', date: '' },
    { title: 'Arrival (2016)', source: 'radarr', status: 'queued', progress: 0, timeLeft: '', date: '' },
  ],
  recent: [{ title: 'The Bear S03E01 Tomorrow', source: 'jellyfin', status: '', progress: 0, timeLeft: '', date: new Date().toISOString() }],
  errors: [],
};

function Section({ title, items, children }: { title: string, items: PipelineItem[], children: (item: PipelineItem) => React.ReactNode }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-gray-500">{title}</span>
      {items.map((item, i) => <div key={i}>{children(item)}</div>)}
    </div>
  )
}

// asked on seerr -> downloading on sonarr/radarr -> showed up on jellyfin. whatever is configured shows up
export default function ComingSoon({enabled = false}: {enabled?: boolean}) {
  const { data, error } = usePolling<MediaPipeline>('/media/pipeline', enabled, 30000);
  const pipeline = enabled ? data : demo;

  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
  if (!pipeline) return null;

  const empty = pipeline.requests.length + pipeline.downloads.length + pipeline.recent.length === 0;

  return (
    <div className="flex flex-col gap-4 w-full px-3 pb-3 text-xs max-h-[28rem] overflow-y-auto">
      {pipeline.errors.map(e => <p key={e} className="text-red-400 truncate" title={e}>{e}</p>)}
      {empty && pipeline.errors.length === 0 && (
        <p className="text-center text-gray-400 mt-4">Nothing on the way. Configure Seerr, Sonarr, Radarr or Jellyfin to fill this.</p>
      )}

      <Section title="Requested" items={pipeline.requests}>
        {item => (
          <div className="flex justify-between gap-2">
            <span className="truncate text-gray-200">{item.title}</span>
            <span className={`shrink-0 ${item.status === 'approved' ? 'text-blue-400' : 'text-amber-400'}`}>{item.status}</span>
          </div>
        )}
      </Section>

      <Section title="Downloading" items={pipeline.downloads}>
        {item => (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between gap-2">
              <span className="truncate text-gray-200">{item.title}</span>
              <span className="shrink-0 text-gray-400">{item.timeLeft || item.status}</span>
            </div>
            <div className="w-full h-1 bg-gray-700 rounded overflow-hidden">
              <div className="h-full rounded bg-blue-400" style={{ width: `${item.progress * 100}%` }} />
            </div>
          </div>
        )}
      </Section>

      <Section title="Just added" items={pipeline.recent}>
        {item => (
          <div className="flex justify-between gap-2">
            <span className="truncate text-gray-200">{item.title}</span>
            <span className="shrink-0 text-emerald-400">{timeAgo(item.date)}</span>
          </div>
        )}
      </Section>
    </div>
  )
}
