"use client";

import { useEffect, useState } from 'react'
import Api from '@/Components/Api'

// the widgets on top of an integration all start by asking if it is set up. the older
// integrations (npm, cloudflare, transmission) have their own config path
export function useIntegrated(name: string, enabled: boolean, path = `/services/${name}/config`) {
  const [integrated, setIntegrated] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    Api().get(path)
      .then(res => setIntegrated(res?.data?.status === true))
      .catch(() => setIntegrated(false));
  }, [path, enabled]);

  return integrated;
}

// keeps asking every interval while the widget is enabled. the widget shows its demo data otherwise
export function usePolling<T>(path: string, enabled: boolean, interval = 60000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    function load() {
      Api().get(path)
        .then(res => {
          setData(res?.data?.data ?? null);
          setError("");
        })
        .catch(err => setError(err?.response?.data?.message || "Could not load"));
    }
    load();
    const timer = setInterval(load, interval);
    return () => clearInterval(timer);
  }, [path, enabled, interval, tick]);

  return { data, error, reload: () => setTick(prev => prev + 1) };
}

export function NotIntegrated({ name }: { name: string }) {
  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      <p className="text-sm text-gray-400">{name} is not integrated. Please check your configuration.</p>
    </div>
  )
}

export function timeAgo(date: string) {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

export function daysUntil(date: string) {
  return (new Date(date).getTime() - Date.now()) / 86400000;
}

// small red/amber dot the "needs a human" widgets share
export function Dot({ critical }: { critical: boolean }) {
  return <span className={`h-2 w-2 rounded-full shrink-0 ${critical ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`} />
}
