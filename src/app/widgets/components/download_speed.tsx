"use client";

import React, { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react';
import Api from '@/Components/Api';
import { QbitTorrent, TransmissionTorrent } from '../Interfaces';
import { formatSpeed } from '../TorrentItem';
import { useIntegrated } from '../service';

interface Sample {
  down: number
  up: number
}

const SAMPLES = 60; // 5 minutes at one every 5s

function demoSamples(): Sample[] {
  return Array.from({ length: SAMPLES }, (_, i) => ({
    down: (6 + 4 * Math.sin(i / 6)) * 1024 * 1024,
    up: (0.8 + 0.4 * Math.cos(i / 4)) * 1024 * 1024,
  }));
}

// the chart only lives while the page is open, nothing of this is saved
function Chart({ samples }: { samples: Sample[] }) {
  const max = Math.max(1, ...samples.map(s => Math.max(s.down, s.up)));
  const line = (key: keyof Sample) => samples
    .map((s, i) => `${(i / (SAMPLES - 1)) * 300},${60 - (s[key] / max) * 56}`)
    .join(' ');

  return (
    <svg viewBox="0 0 300 60" preserveAspectRatio="none" className="w-full h-16">
      <polyline points={line('down')} fill="none" stroke="#60a5fa" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <polyline points={line('up')} fill="none" stroke="#4ade80" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

// both torrent clients added together, whichever ones are configured
export default function DownloadSpeed({enabled = false}: {enabled?: boolean}) {
  const transmission = useIntegrated('transmission', enabled, '/transmission/config');
  const qbittorrent = useIntegrated('qbittorrent', enabled);
  const [samples, setSamples] = useState<Sample[]>(enabled ? [] : demoSamples());

  useEffect(() => {
    if (!enabled || (!transmission && !qbittorrent)) return;

    function load() {
      const requests = [];
      if (transmission) {
        requests.push(Api().get('/transmission/torrents').then(res => (res?.data?.data || []).reduce(
          (sum: Sample, t: TransmissionTorrent) => ({ down: sum.down + (t.rateDownload || 0), up: sum.up + (t.rateUpload || 0) }), { down: 0, up: 0 })));
      }
      if (qbittorrent) {
        requests.push(Api().get('/qbittorrent/torrents').then(res => (res?.data?.data || []).reduce(
          (sum: Sample, t: QbitTorrent) => ({ down: sum.down + t.dlspeed, up: sum.up + t.upspeed }), { down: 0, up: 0 })));
      }
      // one client failing still counts the other one
      Promise.allSettled(requests).then(results => {
        const total = { down: 0, up: 0 };
        for (const r of results) {
          if (r.status === 'fulfilled') {
            total.down += r.value.down;
            total.up += r.value.up;
          }
        }
        setSamples(prev => [...prev, total].slice(-SAMPLES));
      });
    }
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [enabled, transmission, qbittorrent]);

  if (enabled && !transmission && !qbittorrent) {
    return <p className="text-center text-sm text-gray-400 p-4">Configure Transmission or qBittorrent to see this.</p>
  }

  const now = samples[samples.length - 1] || { down: 0, up: 0 };

  return (
    <div className="flex flex-col gap-2 w-full px-3 pb-3 text-xs">
      <div className="flex justify-around">
        <span className="flex items-center gap-1 text-lg font-mono text-blue-400"><ArrowDown className="h-4 w-4" />{formatSpeed(now.down)}</span>
        <span className="flex items-center gap-1 text-lg font-mono text-emerald-400"><ArrowUp className="h-4 w-4" />{formatSpeed(now.up)}</span>
      </div>
      {samples.length > 1 && <Chart samples={samples} />}
      <p className="text-center text-[10px] text-gray-500">last 5 minutes</p>
    </div>
  )
}
