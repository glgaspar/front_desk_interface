"use client"
import React, { useEffect, useState } from 'react'
import Api, { track } from '@/Components/Api'
import toast from 'react-hot-toast'
import Loader from '@/Components/Loader'
import MultiLineChart from '@/Components/Charts/Multline'
import { getUsageColor } from '@/Utils/usageColor'
import { MetricPoint, Range, Uptime, UptimePoint } from './Interfaces'

const ranges: Range[] = ["1h", "24h", "7d", "30d"]
const diskColors = ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

function label(time: string, range: Range) {
    const date = new Date(time)
    if (range === "1h" || range === "24h") return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit' })
}

// green when its fine, red when its not. uptime is the other way around from cpu so flipping it
function uptimeColor(percent: number) {
    return getUsageColor(100 - percent)
}

function History({ appKey, range }: { appKey: string, range: Range }) {
    const [points, setPoints] = useState<UptimePoint[] | null>(null)

    useEffect(() => {
        Api().get(`/monitoring/uptime/history?app=${encodeURIComponent(appKey)}&range=${range}`)
            .then(response => setPoints(response?.data?.data || []))
            .catch(error => {
                setPoints([])
                toast.error(error?.response?.data?.message || 'Could not load history')
            })
    }, [appKey, range])

    if (!points) return <Loader />

    return (
        <div className='p-3 grid gap-3'>
            <div className='flex gap-[2px] h-6 items-stretch' title='each bar is one bucket'>
                {points.map(p => (
                    <div key={p.time} className='flex-1 rounded-sm' style={{ background: uptimeColor(p.uptimePercent) }} title={`${label(p.time, range)} - ${p.uptimePercent.toFixed(1)}%`} />
                ))}
            </div>
            <MultiLineChart
                title='Latency (ms)'
                chartData={{
                    labels: points.map(p => label(p.time, range)),
                    datasets: [{ label: 'Latency', data: points.map(p => p.avgLatencyMs), borderColor: '#b3078b', backgroundColor: '#b3078b33', fill: true, pointRadius: 0, tension: 0.3 }],
                }}
                options={{ plugins: { legend: { display: false } } }}
            />
        </div>
    )
}

// every disk that shows up anywhere in the range gets its own line
function diskPaths(metrics: MetricPoint[]) {
    return [...new Set(metrics.flatMap(m => Object.keys(m.disks || {})))].sort()
}

export default function Monitoring() {
    const [range, setRange] = useState<Range>("24h")
    const [metrics, setMetrics] = useState<MetricPoint[] | null>(null)
    const [uptime, setUptime] = useState<Uptime[] | null>(null)
    const [open, setOpen] = useState<string | null>(null)

    useEffect(() => {
        setMetrics(null)
        setUptime(null)
        Api().get(`/monitoring/metrics?range=${range}`)
            .then(response => setMetrics(response?.data?.data || []))
            .catch(error => {
                setMetrics([])
                toast.error(error?.response?.data?.message || 'Could not load host metrics')
            })
        Api().get(`/monitoring/uptime?range=${range}`)
            .then(response => setUptime(response?.data?.data || []))
            .catch(error => {
                setUptime([])
                toast.error(error?.response?.data?.message || 'Could not load uptime')
            })
    }, [range])

    return (
        <div className='p-4 md:p-8 grid gap-6 max-w-6xl mx-auto w-full'>
            <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
                <h1 className='text-3xl font-bold tracking-tight'>Monitoring</h1>
                <div className='flex items-center bg-black border border-zinc-800 p-0.5 rounded-lg'>
                    {ranges.map(r => (
                        <button key={r} onClick={() => { setRange(r); track("changed monitoring range", r) }} className={`px-3 py-1 text-sm rounded-md transition-colors cursor-pointer ${range === r ? 'bg-[#b3078b] text-white' : 'text-gray-400 hover:text-white'}`}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <div className='p-4 border border-[#b3078b]/40 rounded-xl bg-[#0d0d0d]'>
                {!metrics ? <Loader /> : metrics.length === 0 ? (
                    <p className='text-center text-gray-500 py-8'>No samples yet, give it a minute</p>
                ) : (
                    <MultiLineChart
                        title='Host usage (%)'
                        chartData={{
                            labels: metrics.map(m => label(m.time, range)),
                            datasets: [
                                { label: 'CPU', data: metrics.map(m => m.cpuPercent), borderColor: '#3b82f6', pointRadius: 0, tension: 0.3 },
                                { label: 'Memory', data: metrics.map(m => m.memPercent), borderColor: '#10b981', pointRadius: 0, tension: 0.3 },
                                ...diskPaths(metrics).map((path, i) => ({
                                    label: `Disk ${path}`,
                                    data: metrics.map(m => m.disks?.[path] ?? null),
                                    borderColor: diskColors[i % diskColors.length],
                                    pointRadius: 0,
                                    tension: 0.3,
                                })),
                            ],
                        }}
                        options={{ scales: { y: { beginAtZero: true, max: 100 } } }}
                    />
                )}
            </div>

            <div className='w-full overflow-x-auto rounded-xl border border-zinc-800 bg-[#0d0d0d]'>
                <table className='w-full border-collapse text-left text-sm text-zinc-300'>
                    <thead className='bg-[#141414] border-b border-[#b3078b]/30 text-xs uppercase tracking-wider text-gray-400'>
                        <tr>
                            <th className='py-3 px-4'>App</th>
                            <th className='py-3 px-4'>Status</th>
                            <th className='py-3 px-4'>Uptime</th>
                            <th className='py-3 px-4'>Avg latency</th>
                            <th className='py-3 px-4'>Since</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-zinc-800/40'>
                        {!uptime && <tr><td colSpan={5}><Loader /></td></tr>}
                        {uptime?.length === 0 && <tr><td colSpan={5} className='py-8 text-center text-gray-500'>Nothing checked yet</td></tr>}
                        {uptime?.map(u => (
                            <React.Fragment key={u.appKey}>
                                <tr className='hover:bg-zinc-900/30 transition-colors cursor-pointer' onClick={() => setOpen(prev => prev === u.appKey ? null : u.appKey)}>
                                    <td className='py-3 px-4 font-medium text-white'>{u.appName}</td>
                                    <td className='py-3 px-4'>
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${u.up ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${u.up ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`} />
                                            {u.up ? 'UP' : 'DOWN'}
                                        </span>
                                    </td>
                                    <td className='py-3 px-4 font-mono' style={{ color: uptimeColor(u.uptimePercent) }}>{u.uptimePercent.toFixed(2)}%</td>
                                    <td className='py-3 px-4 font-mono text-xs'>{u.avgLatencyMs != null ? `${Math.round(u.avgLatencyMs)} ms` : '-'}</td>
                                    <td className='py-3 px-4 text-xs text-gray-400'>{new Date(u.changedAt).toLocaleString()}</td>
                                </tr>
                                {open === u.appKey && (
                                    <tr><td colSpan={5}><History appKey={u.appKey} range={range} /></td></tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
