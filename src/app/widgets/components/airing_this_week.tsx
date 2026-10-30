"use client";

import React from 'react'
import { CheckCircle2 } from 'lucide-react';
import { CalendarItem, MediaCalendar } from '../Interfaces';
import { usePolling } from '../service';

const day = 86400000;
const demo: MediaCalendar = {
  errors: [],
  items: [
    { title: 'Severance S02E04', date: new Date().toISOString(), source: 'sonarr', hasFile: true },
    { title: 'The Bear S03E02', date: new Date(Date.now() + day).toISOString(), source: 'sonarr', hasFile: false },
    { title: 'Dune: Part Two (2024) digital', date: new Date(Date.now() + 3 * day).toISOString(), source: 'radarr', hasFile: false },
  ],
};

function dayLabel(date: string) {
  const d = new Date(date);
  const today = new Date();
  const diff = Math.round((new Date(d.toDateString()).getTime() - new Date(today.toDateString()).getTime()) / day);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return d.toLocaleDateString([], { weekday: 'long', day: '2-digit', month: '2-digit' });
}

export default function AiringThisWeek({enabled = false}: {enabled?: boolean}) {
  const { data, error } = usePolling<MediaCalendar>('/media/calendar?days=7', enabled, 1800000);
  const calendar = enabled ? data : demo;

  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>
  if (!calendar) return null;

  const days: Record<string, CalendarItem[]> = {};
  for (const item of calendar.items) {
    (days[dayLabel(item.date)] ||= []).push(item);
  }

  return (
    <div className="flex flex-col gap-3 w-full px-3 pb-3 text-xs max-h-[28rem] overflow-y-auto">
      {calendar.errors.map(e => <p key={e} className="text-red-400 truncate" title={e}>{e}</p>)}
      {calendar.items.length === 0 && calendar.errors.length === 0 && (
        <p className="text-center text-gray-400 mt-4">Nothing airing this week. Configure Sonarr or Radarr to fill this.</p>
      )}
      {Object.entries(days).map(([label, items]) => (
        <div key={label} className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-500">{label}</span>
          {items.map((item, i) => (
            <div key={i} className="flex justify-between gap-2">
              <span className="truncate text-gray-200">{item.title}</span>
              <span className="flex items-center gap-1 shrink-0 text-gray-500">
                {item.source === 'sonarr' && new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {item.hasFile && <CheckCircle2 className="h-3 w-3 text-emerald-400" aria-label="already downloaded" />}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
