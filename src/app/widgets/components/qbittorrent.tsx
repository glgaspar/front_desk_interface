"use client";

import React from 'react'
import Api from '@/Components/Api'
import TorrentItem from '../TorrentItem';
import { QbitTorrent } from '../Interfaces';
import { NotIntegrated, useIntegrated, usePolling } from '../service';

// qbittorrent states are strings, grouped the same way the transmission colors are
function getStateColor(state: string) {
  if (state === 'error' || state === 'missingFiles') return 'bg-red-500';
  if (state.startsWith('paused') || state.startsWith('stopped')) return 'bg-gray-500';
  if (state.startsWith('checking') || state === 'moving') return 'bg-yellow-400';
  if (state.startsWith('queued')) return state.endsWith('UP') ? 'bg-green-600' : 'bg-blue-600';
  if (['uploading', 'stalledUP', 'forcedUP'].includes(state)) return 'bg-green-400';
  if (['downloading', 'stalledDL', 'forcedDL', 'metaDL', 'forcedMetaDL'].includes(state)) return 'bg-blue-400';
  return 'bg-[#b3078b]';
}

const demo: QbitTorrent[] = [
  { hash: '1', name: 'Ubuntu 24.04 Desktop ISO', progress: 0.85, dlspeed: 12500000, upspeed: 120000, state: 'downloading' },
  { hash: '2', name: 'Debian 12.5.0 amd64 netinst', progress: 1, dlspeed: 0, upspeed: 560000, state: 'uploading' },
  { hash: '3', name: 'Arch Linux 2024.04.01', progress: 0.12, dlspeed: 0, upspeed: 0, state: 'stoppedDL' },
];

export default function Qbittorrent({enabled = false}: {enabled?: boolean}) {
  const integrated = useIntegrated('qbittorrent', enabled);
  const { data, error, reload } = usePolling<QbitTorrent[]>('/qbittorrent/torrents', enabled && integrated);
  const torrents = enabled ? data || [] : demo;

  if (!integrated && enabled) return <NotIntegrated name="qBittorrent" />

  return (
    <div className="w-full h-full flex flex-col py-4 b-4">
      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
        {error && <span className="self-center text-sm text-red-400 mt-4">{error}</span>}
        {!error && torrents.length === 0 && (
          <span className="self-center text-sm font-medium text-gray-400 mt-4">No active torrents</span>
        )}
        {torrents.map(t => (
          <TorrentItem
            key={t.hash}
            mock={!enabled}
            item={{ id: t.hash, name: t.name, progress: t.progress, down: t.dlspeed, up: t.upspeed, color: getStateColor(t.state) }}
            action={action => Api().post(`/qbittorrent/toggle/${t.hash}/${action}`).finally(reload)}
          />
        ))}
      </div>
    </div>
  )
}
