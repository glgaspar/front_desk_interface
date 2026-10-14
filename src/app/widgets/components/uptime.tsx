"use client"

import React, { useEffect, useState } from 'react'
import Api from '@/Components/Api';
import { Uptime as UptimeData } from '@/app/monitoring/Interfaces';
import { getUsageColor } from '@/Utils/usageColor';

export default function Uptime({enabled = false}: {enabled?: boolean}) {
  const [data, setData] = useState<UptimeData[] | null>(null);

  useEffect(() => {
    if (!enabled) {
      // just so you can see what it looks like before enabling it
      const now = new Date().toISOString();
      setData([
        { appKey: '/jellyfin|Jellyfin', appName: 'Jellyfin', uptimePercent: 100, up: true, changedAt: now, avgLatencyMs: 42, checks: 1440 },
        { appKey: '/nextcloud|Nextcloud', appName: 'Nextcloud', uptimePercent: 97.3, up: true, changedAt: now, avgLatencyMs: 230, checks: 1440 },
        { appKey: '/vaultwarden|Vaultwarden', appName: 'Vaultwarden', uptimePercent: 99.9, up: true, changedAt: now, avgLatencyMs: 18, checks: 1440 },
        { appKey: '/immich|Immich', appName: 'Immich', uptimePercent: 61.2, up: false, changedAt: now, avgLatencyMs: null, checks: 1440 },
      ]);
      return;
    }

    function load() {
      Api()
        .get("/monitoring/uptime?range=24h")
        .then((res) => setData(res?.data?.data || []))
        .catch((err) => console.log(err));
    }
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [enabled]);

  if (!data) return null;

  const down = data.filter(u => !u.up);
  const shaky = data.filter(u => u.up && u.uptimePercent < 99);
  const fine = data.length - down.length - shaky.length;

  return (
    <div className="flex flex-col gap-2 w-full px-3 pb-3 text-xs">
      <p className="text-center text-gray-400">
        {data.length === 0 ? "Nothing checked yet" : `${fine} of ${data.length} apps healthy in the last 24h`}
      </p>
      {[...down, ...shaky].map(u => (
        <div key={u.appKey} className="flex justify-between items-center">
          <span className="flex items-center gap-2 truncate">
            <span className={`h-2 w-2 rounded-full shrink-0 ${u.up ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`} />
            <span className="truncate">{u.appName}</span>
          </span>
          <span className="font-mono shrink-0" style={{ color: getUsageColor(100 - u.uptimePercent) }}>
            {u.up ? `${u.uptimePercent.toFixed(1)}%` : 'DOWN'}
          </span>
        </div>
      ))}
    </div>
  );
}
