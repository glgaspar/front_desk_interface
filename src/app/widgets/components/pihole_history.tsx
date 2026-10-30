"use client"

import React, { useState } from 'react'
import { NotIntegrated, useIntegrated, usePolling } from '../service';

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

// stacked from the bottom up, the top of the stack is the total so it doesnt need its own line
const layers = [
  { key: 'blocked', color: '#ef4444' },
  { key: 'cached', color: '#10b981' },
  { key: 'forwarded', color: '#3b82f6' },
] as const;

const demo: History[] = Array.from({ length: 48 }, (_, i) => {
  const wave = Math.sin(i / 7) * 20 + 40 + (i % 5) * 3;
  const blocked = Math.round(wave * 0.25);
  const cached = Math.round(wave * 0.2);
  const forwarded = Math.round(wave * 0.55);
  return { timestamp: Date.now() - (47 - i) * 600000, total: blocked + cached + forwarded, cached, blocked, forwarded };
});

const W = 300;
const H = 100;

function time(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function PiholeHistory({enabled = false}: {enabled?: boolean}) {
  const integrated = useIntegrated('pihole', enabled);
  const { data, error } = usePolling<HistoryWrapper>('/pihole/history', enabled);
  const [hover, setHover] = useState<number | null>(null);

  if (!integrated) return <NotIntegrated name="Pihole" />
  if (error) return <p className="text-center text-sm text-red-400 p-4">{error}</p>

  const history = enabled ? data?.history : demo;
  if (!history) return null;
  if (history.length < 2) return <p className="text-center text-sm text-gray-400 p-4">No data yet</p>

  const max = Math.max(1, ...history.map(h => h.blocked + h.cached + h.forwarded));
  const x = (i: number) => (i / (history.length - 1)) * W;
  const y = (v: number) => H - (v / max) * H;

  // cumulative heights, one row per layer
  const stacks = layers.map((_, l) => history.map(h => layers.slice(0, l + 1).reduce((sum, layer) => sum + h[layer.key], 0)));

  const total = history.reduce((sum, h) => sum + h.total, 0);
  const blocked = history.reduce((sum, h) => sum + h.blocked, 0);
  const point = hover !== null ? history[hover] : null;
  const labels = [0, 0.25, 0.5, 0.75, 1].map(f => history[Math.round(f * (history.length - 1))]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setHover(Math.round(((e.clientX - rect.left) / rect.width) * (history!.length - 1)));
  }

  return (
    <div className="flex flex-col h-full w-full px-3 pb-2 text-xs">
      <div className="flex justify-between text-gray-400 mb-1">
        <span><span className="text-gray-100 font-semibold">{total.toLocaleString()}</span> queries</span>
        <span><span className="text-red-400 font-semibold">{total ? ((blocked / total) * 100).toFixed(1) : 0}%</span> blocked</span>
      </div>

      <div className="relative flex-[1_1_10rem] min-h-16" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            {layers.map(layer => (
              <linearGradient key={layer.key} id={`pihole-${layer.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={layer.color} stopOpacity="0.55" />
                <stop offset="100%" stopColor={layer.color} stopOpacity="0.15" />
              </linearGradient>
            ))}
          </defs>

          {[0, 0.5].map(f => (
            <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#3f3f46" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          ))}

          {/* drawn top layer first so the lower ones sit on top of it */}
          {[...layers].reverse().map((layer, r) => {
            const l = layers.length - 1 - r;
            const top = stacks[l].map((v, i) => `${x(i)},${y(v)}`);
            const bottom = l === 0 ? [`${W},${H}`, `0,${H}`] : stacks[l - 1].map((v, i) => `${x(i)},${y(v)}`).reverse();
            return (
              <g key={layer.key}>
                <polygon points={[...top, ...bottom].join(' ')} fill={`url(#pihole-${layer.key})`} />
                <polyline points={top.join(' ')} fill="none" stroke={layer.color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              </g>
            )
          })}

          {hover !== null && (
            <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="#e5e7eb" strokeOpacity="0.5" vectorEffect="non-scaling-stroke" />
          )}
        </svg>

        <span className="absolute top-0 left-0 text-[10px] text-gray-500 -translate-y-1/2 bg-black pr-1">{max}</span>

        {point && hover !== null && (
          <div
            className="absolute top-1 z-10 pointer-events-none rounded border border-zinc-700 bg-black/90 px-2 py-1 whitespace-nowrap"
            style={hover > history.length / 2 ? { right: `${100 - (hover / (history.length - 1)) * 100}%`, marginRight: 6 } : { left: `${(hover / (history.length - 1)) * 100}%`, marginLeft: 6 }}
          >
            <div className="text-gray-400">{time(point.timestamp)}</div>
            {[...layers].reverse().map(layer => (
              <div key={layer.key} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: layer.color }} />
                <span className="capitalize text-gray-300">{layer.key}</span>
                <span className="ml-auto pl-2 text-gray-100">{point[layer.key]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
        {labels.map((h, i) => <span key={i}>{time(h.timestamp)}</span>)}
      </div>

      <div className="flex justify-center gap-3 mt-1">
        {layers.map(layer => (
          <span key={layer.key} className="flex items-center gap-1 text-gray-400 capitalize">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: layer.color }} />
            {layer.key}
          </span>
        ))}
      </div>
    </div>
  )
}
