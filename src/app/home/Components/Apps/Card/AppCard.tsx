import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { Power } from 'lucide-react';
import App from '../../../Interfaces/Apps'
import dockerSVG from '@/Components/Static/docker-svgrepo-com.svg'
import Image from 'next/image';
import Card from '@/Components/Card';
import Api from '@/Components/Api';
import AppConfig from '../AppConfig';
import { useUser } from '@/Components/User';
import ProgressBar from '@/Components/ProgressBar';
import { getUsageColor } from '@/Utils/usageColor';
import { useAppStats, useAppUpdate, useAppUptime } from '../AppsContext';
import { confirmStreams } from '../confirmStreams';

export default function AppCard({item, onAppUpdate}:{item:App, onAppUpdate:(oldAppID:string, updatedApp: App|null)=>void}) {
    const running = item.state?.status == "running"
    const [toggling, setToggling] = useState(false)
    const { isAdmin } = useUser()
    const stats = useAppStats(item)
    const update = useAppUpdate(item)
    const uptime = useAppUptime(item)

    async function turnOnOff() {
        if (toggling) return
        let toggle = "start"
        if (running) {
            toggle = "stop"
            if (!await confirmStreams(item, "Stop")) return
        }
        setToggling(true)
        Api()
            .put(`/apps/toggleOnOff/${item.id}/${toggle}`)
            .then((response) => {
                onAppUpdate(item.id, response?.data?.data)
            })
            .catch((error) => {
                toast.error(
                    error?.response?.data?.message ||
                        "Unknow error toggling app. Better luck next time..."
                );
            })
            .finally(() => setToggling(false))
    }

    // header with the name and badges, stats in the middle and the buttons at the bottom.
    // everything truncates so long names stop running over the border
    return (
        <Card className='bg-black w-full min-h-[11rem] flex flex-col gap-2 overflow-hidden' key={item.id}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className='flex items-center gap-2 min-w-0 group' title={item.name}>
                <Image src={item.logo||dockerSVG} alt={item.name} className="h-8 w-8 shrink-0 rounded-lg object-contain" width={32} height={32} unoptimized />
                <p className='truncate font-medium group-hover:text-[#e04fbf] transition-colors'>{item.name}</p>
            </a>

            <div className='flex flex-wrap items-center gap-1 text-[10px] font-medium'>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${
                    running
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${running ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {(item.state?.status || "unknown").toUpperCase()}
                </span>
                {uptime &&
                    <span className='px-1.5 py-0.5 rounded-full border border-zinc-800 font-mono' style={{ color: getUsageColor(100 - uptime.uptimePercent) }} title='Uptime last 24h'>
                        {uptime.uptimePercent.toFixed(1)}%
                    </span>
                }
                {update?.status === "update_available" &&
                    <span className='px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20' title='There is a newer image'>
                        UPDATE
                    </span>
                }
            </div>

            <div className='flex flex-col gap-1 text-[10px] text-gray-400 flex-1 justify-end' title={stats ? `MEM ${stats.memUsage}` : undefined}>
                {stats && running ? (
                    <>
                        <div className='flex justify-between font-mono'><span>CPU</span><span>{stats.cpuPercent.toFixed(1)}%</span></div>
                        <ProgressBar className='h-1' color={getUsageColor(stats.cpuPercent)} percentage={Math.min(stats.cpuPercent, 100)} />
                        <div className='flex justify-between font-mono'><span>MEM</span><span>{stats.memPercent.toFixed(1)}%</span></div>
                        <ProgressBar className='h-1' color={getUsageColor(stats.memPercent)} percentage={stats.memPercent} />
                    </>
                ) : (
                    <span className='text-center text-gray-600'>{running ? 'no stats yet' : 'not running'}</span>
                )}
            </div>

            <div className='flex justify-between items-center border-t border-zinc-800 pt-2'>
                <AppConfig app={item} onAppUpdate={onAppUpdate} />
                <button
                    onClick={turnOnOff}
                    disabled={toggling || !isAdmin}
                    className={`p-1.5 rounded-full border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${toggling ? 'animate-pulse' : ''} ${
                        running
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'border-zinc-700 bg-zinc-800/40 text-zinc-400 hover:bg-zinc-800'
                    }`}
                    title={!isAdmin ? "Only admins can do that" : running ? "Stop App" : "Start App"}
                >
                    <Power className="h-4 w-4" />
                </button>
            </div>
        </Card>
    )
}
