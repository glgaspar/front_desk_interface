"use client";

import React, { useEffect, useState } from 'react'
import Api from '@/Components/Api'
import { TransmissionTorrent } from '../Interfaces';
import TorrentItem from '../TorrentItem';

function getStatusColor(status?: number) {
  switch (status) {
    case 0: return 'bg-gray-500'; // Stopped
    case 1: return 'bg-yellow-600'; // Queued to verify
    case 2: return 'bg-yellow-400'; // Verifying
    case 3: return 'bg-blue-600'; // Queued to download
    case 4: return 'bg-blue-400'; // Downloading
    case 5: return 'bg-green-600'; // Queued to seed
    case 6: return 'bg-green-400'; // Seeding
    default: return 'bg-[#b3078b]'; // Unknown
  }
}

export default function Transmission({enabled = false, selected = false}: {enabled?: boolean, selected?: boolean}) {
  const [torrents, setTorrents] = useState<TransmissionTorrent[]>([]);
  const [integrated, setIntegrated] = useState(false);
  
  const fetchTorrents = () => {
    Api().get('/transmission/torrents')
      .then(res => {
        if (res?.data?.data) {
          const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
          setTorrents(data);
        }
      })
      .catch(err => console.error(err));
  };
  
  useEffect(() => {
    if (!enabled) {
      setTorrents([
        { id: 1, name: 'Ubuntu 24.04 Desktop ISO', percentDone: 0.85, rateDownload: 12500000, rateUpload: 120000, status: 4 },
        { id: 2, name: 'Debian 12.5.0 amd64 netinst', percentDone: 1.0, rateDownload: 0, rateUpload: 560000, status: 6 },
        { id: 3, name: 'Arch Linux 2024.04.01', percentDone: 0.12, rateDownload: 8500000, rateUpload: 25000, status: 3 },
        { id: 4, name: 'Ubuntu 24.04 Desktop ISO', percentDone: 0.85, rateDownload: 12500000, rateUpload: 120000, status: 0 },
        { id: 5, name: 'Debian 12.5.0 amd64 netinst', percentDone: 1.0, rateDownload: 0, rateUpload: 560000, status: 5 },
        { id: 6, name: 'Arch Linux 2024.04.01', percentDone: 0.12, rateDownload: 8500000, rateUpload: 25000, status: 2 }
      ] as TransmissionTorrent[]);
      return;
    }

    Api()
      .get("/transmission/config")
      .then((res) => {
        if (res?.data) {
          setIntegrated(res.data.status)}
      });

    fetchTorrents();
    const interval = setInterval(fetchTorrents, 60000);
    return () => clearInterval(interval);
  }, [enabled]);

  if (!integrated && enabled) {
    return (
        <div className="flex flex-col justify-center items-center h-full w-full">
          <p className="text-sm text-gray-400">Transmission is not integrated. Please check your configuration.</p>
        </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col py-4 b-4">
      <div className="flex flex-col gap-3 overflow-y-scroll">
        {torrents.length === 0 && (
          <span className="self-center text-sm font-medium text-gray-400 mt-4">No active torrents</span>
        )}
        {torrents.map(t => (
          <TorrentItem
            key={t.id}
            mock={!enabled}
            item={{ id: String(t.id), name: t.name, progress: t.percentDone || 0, down: t.rateDownload, up: t.rateUpload, color: getStatusColor(t.status) }}
            action={action => Api().post(`/transmission/toggle/${t.id}/${action}`).finally(fetchTorrents)}
          />
        ))}
      </div>
    </div>
  )
  
}
