"use client"

import React, { useEffect, useState } from 'react'
import Api from '@/Components/Api';

interface HistoryWrapper {
	history: History[]
	took:    number  
}

interface History {
	timestamp:  number 
	total:      number 
	cached:     number 
	blocked:    number 
	forwarded:  number 
}

const colors = {
  total: "#3b82f6",     // blue
  cached: "#10b981",    // emerald
  blocked: "#ef4444",   // red
  forwarded: "#f59e0b", // amber
} as const;

export default function PiholeHistory({enabled = false}: {enabled?: boolean}) {
  const [data, setData] = useState<HistoryWrapper | null>(null);
  const [integrated, setIntegrated] = useState(false);

  useEffect(() => {
    if (!enabled) {
      const now = Date.now();
      setData({
        took: 0,
        history: [
          { timestamp: now - 900000, total: 10, cached: 3, blocked: 2, forwarded: 5 },
          { timestamp: now - 800000, total: 25, cached: 5, blocked: 10, forwarded: 10 },
          { timestamp: now - 700000, total: 15, cached: 3, blocked: 5, forwarded: 7 },
          { timestamp: now - 600000, total: 40, cached: 2, blocked: 18, forwarded: 20 },
          { timestamp: now - 500000, total: 30, cached: 10, blocked: 5, forwarded: 15 },
          { timestamp: now - 400000, total: 55, cached: 8, blocked: 12, forwarded: 35 },
          { timestamp: now - 300000, total: 45, cached: 7, blocked: 8, forwarded: 30 },
          { timestamp: now - 200000, total: 70, cached: 9, blocked: 21, forwarded: 40 },
          { timestamp: now - 100000, total: 60, cached: 7, blocked: 13, forwarded: 40 },
          { timestamp: now, total: 85, cached: 15, blocked: 20, forwarded: 50 },
        ]
      });
      return;
    }

    Api()
      .get("/cloudflare/config")
      .then((res) => {
        if (!res.data) {
          setIntegrated(res.data.status)}
      });

    Api()
      .get("/pihole/history")
      .then((res) => {
        setData(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      })
  }, [enabled]);

  const maxTotal = data?.history.length ? Math.max(1, ...data.history.map(h => h.total)) : 1;
  
  const labelIndices = data?.history.length 
    ? Array.from(new Set([
        0,
        Math.floor(data.history.length / 4),
        Math.floor(data.history.length / 2),
        Math.floor((data.history.length * 3) / 4),
        data.history.length - 1
      ]))
    : [];
  
  if (!integrated && enabled) {
    return (
        <div className="flex flex-col justify-center items-center h-full w-full">
          <p className="text-sm text-gray-400">Pihole is not integrated. Please check your configuration.</p>
        </div>
    )
  }

  return (
      <div className="flex flex-col justify-between h-full w-full pb-3 px-2">
          {data && data.history.length > 0 ? (
            <>
              <svg className="w-full flex-1 min-h-0 mt-2" viewBox="0 0 1000 200" preserveAspectRatio="none">
                {/* Draw data lines */}
                {(Object.keys(colors) as Array<keyof typeof colors>).map((key) => (
                  <polyline
                    key={key}
                    points={data.history.map((item, idx) => {
                      const x = (idx / (data.history.length - 1)) * 930 + 45;
                      const y = 150 - (item[key] / maxTotal) * 120;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke={colors[key]}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                
                {/* Y Axis Grid Lines */}
                <line x1="45" y1="30" x2="975" y2="30" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" vectorEffect="non-scaling-stroke" />
                <line x1="45" y1="90" x2="975" y2="90" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" vectorEffect="non-scaling-stroke" />

                {/* X Axis Line */}
                <line x1="45" y1="150" x2="975" y2="150" stroke="#e5e7eb" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                
                {/* Y Axis Labels */}
                <text x="35" y="34" fill="#9ca3af" fontSize="12" textAnchor="end">{Math.round(maxTotal)}</text>
                <text x="35" y="94" fill="#9ca3af" fontSize="12" textAnchor="end">{Math.round(maxTotal / 2)}</text>
                <text x="35" y="154" fill="#9ca3af" fontSize="12" textAnchor="end">0</text>

                {/* X Axis Time Labels */}
                {labelIndices.map((idx) => {
                  const item = data.history[idx];
                  const x = (idx / (data.history.length - 1)) * 930 + 45;
                  const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <text key={idx} x={x} y="175" fill="#9ca3af" fontSize="13" textAnchor="middle">
                      {time}
                    </text>
                  );
                })}
              </svg>
              
              <div className="flex flex-wrap gap-4 justify-center mt-1">
                {Object.entries(colors).map(([key, color]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-xs text-gray-300 capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
             <p className="text-gray-400 text-sm">No data available...</p>
          )}
      </div>
  )
}
