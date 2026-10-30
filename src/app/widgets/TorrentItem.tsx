"use client";

import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { useUser } from '@/Components/User';
import { useClickOutside } from '@/Utils/useClickOutside';
import Button from '@/Components/Button';

// outside components/ on purpose, everything in there becomes a widget
export interface TorrentRow {
  id: string
  name?: string
  progress: number
  down?: number
  up?: number
  color: string
}

export function formatBytes(bytes?: number, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(Math.abs(bytes)) / Math.log(k)));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatSpeed(bytes?: number, decimals = 1) {
  return formatBytes(bytes, decimals) + '/s';
}

export default function TorrentItem({ item, action, mock = false }: { item: TorrentRow, action: (action: string) => Promise<unknown>, mock?: boolean }) {
  const progress = item.progress * 100;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false)
  const { isAdmin } = useUser();
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsMenuOpen(false), isMenuOpen);

  const handleAction = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    if (processingAction) return;
    if (mock) {
      // fake torrents, nothing to start or stop
      setIsMenuOpen(false);
      toast("This is just demo data");
      return;
    }
    setProcessingAction(true);
    action(name)
      .catch(error => toast.error(error?.response?.data?.message || "Could not " + name + " it"))
      .finally(() => {
        setProcessingAction(false)
        setIsMenuOpen(false);
      });
  };

  return (
    <div className="flex flex-col text-xs text-gray-300 my-1 p-1 hover:bg-gray-800 rounded m-2 cursor-pointer" onClick={()=> isAdmin && setIsMenuOpen(prev => !prev)}>
      <div className="flex justify-between truncate mb-1">
        <span className="truncate mr-2">{item.name || 'Unknown'}</span>
        <span className="shrink-0">{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-700 rounded overflow-hidden">
        <div className={`h-full rounded ${item.color}`} style={{ width: `${progress}%` }}></div>
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-gray-400">
        <span>D: {formatSpeed(item.down)}</span>
        <span>U: {formatSpeed(item.up)}</span>
      </div>
      {isMenuOpen && (
        <div className="flex justify-around mt-2 pt-2 border-t border-gray-700" ref={menuRef}>
          <Button id={"start_"+item.id} role='generic' onClick={(e) => handleAction(e, 'start')} className="cursor-pointer hover:text-[#b3078b] p-1 transition-colors" title="Start" disabled={processingAction} >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          </Button>
          <Button id={"stop_"+item.id} role='generic' onClick={(e) => handleAction(e, 'stop')} className="cursor-pointer hover:text-[#b3078b] p-1 transition-colors" title="Stop" disabled={processingAction} >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          </Button>
          <Button id={"remove_"+item.id} role='generic' onClick={(e) => handleAction(e, 'remove')} className="cursor-pointer hover:text-red-500 p-1 transition-colors" title="Remove" disabled={processingAction} >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  )
}
