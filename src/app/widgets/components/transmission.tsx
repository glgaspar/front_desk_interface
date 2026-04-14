"use client";

import React, { useEffect, useRef, useState } from 'react'
import Api from '@/Components/Api'
import { useClickOutside } from '@/Utils/useClickOutside';
import Button from '@/Components/Button';
import { TransmissionTorrent } from '../Interfaces';

function formatSpeed(bytes?: number, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B/s';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

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

function TorrentItem({ item, updateList }: { item: TransmissionTorrent, updateList?: () => void }) {
  const progress = (item.percentDone || 0) * 100;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsMenuOpen(false), isMenuOpen);
  
  const handleAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    if (processingAction) return; 
    setProcessingAction(true);
    Api()
      .post(`/transmission/toggle/${item.id}/${action}`)
      .catch(console.error)
      .finally(() => {
        setProcessingAction(false)
        setIsMenuOpen(false);
        updateList?.()
      }
    );
  };
  
  return (
    <div className="flex flex-col text-xs text-gray-300 my-1 p-1 hover:bg-gray-800 rounded m-2 cursor-pointer" onClick={()=>setIsMenuOpen(prev => !prev)}>
      <div className="flex justify-between truncate mb-1">
        <span className="truncate mr-2">{item.name || 'Unknown'}</span>
        <span className="shrink-0">{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-700 rounded overflow-hidden">
        <div className={`h-full rounded ${getStatusColor(item.status)}`} style={{ width: `${progress}%` }}></div>
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-gray-400">
        <span>D: {formatSpeed(item.rateDownload)}</span>
        <span>U: {formatSpeed(item.rateUpload)}</span>
      </div>
      {isMenuOpen && (
        <div className="flex justify-around mt-2 pt-2 border-t border-gray-700" ref={menuRef}>
          <Button id={"start_"+String(item.id)} role='generic' onClick={(e) => handleAction(e, 'start')} className="cursor-pointer hover:text-[#b3078b] p-1 transition-colors" title="Start" disabled={processingAction} >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          </Button>
          <Button id={"stop_"+String(item.id)} role='generic' onClick={(e) => handleAction(e, 'stop')} className="cursor-pointer hover:text-[#b3078b] p-1 transition-colors" title="Stop" disabled={processingAction} >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          </Button>
          <Button id={"remove_"+String(item.id)} role='generic' onClick={(e) => handleAction(e, 'remove')} className="cursor-pointer hover:text-red-500 p-1 transition-colors" title="Remove" disabled={processingAction} >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  )

}

export default function Transmission({enabled = false, selected = false}: {enabled?: boolean, selected?: boolean}) {
  const [torrents, setTorrents] = useState<TransmissionTorrent[]>([]);
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

    fetchTorrents();
    const interval = setInterval(fetchTorrents, 60000);
    return () => clearInterval(interval);
  }, [enabled]);

  
  return (
    <div className="w-full h-full flex flex-col py-4 b-4">
      <div className="flex flex-col gap-3 overflow-y-scroll">
        {torrents.length === 0 && (
          <span className="self-center text-sm font-medium text-gray-400 mt-4">No active torrents</span>
        )}
        {torrents.map(t =>  <TorrentItem key={t.id} item={t} updateList={() => fetchTorrents()} />)}
      </div>
    </div>
  )
  
}
