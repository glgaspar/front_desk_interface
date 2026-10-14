"use client"
import React, { useEffect, useState } from 'react'
import Api from '@/Components/Api'
import toast from 'react-hot-toast'
import Button from '@/Components/Button'
import Loader from '@/Components/Loader'
import App from '../home/Interfaces/Apps'
import { CloudflareRoute, DNSRecord } from './Interfaces'
import { Trash2 } from 'lucide-react'
import { useUser } from '@/Components/User'

const inputClass = 'w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all'

export default function Cloudflare() {
    const [enabled, setEnabled] = useState<boolean | null>(null)
    const [routes, setRoutes] = useState<CloudflareRoute[]>([])
    const [records, setRecords] = useState<DNSRecord[]>([])
    const [apps, setApps] = useState<App[]>([])
    const [loading, setLoading] = useState(true)
    const [refresh, setRefresh] = useState(0)
    const [removeDNS, setRemoveDNS] = useState(true)
    const [selectedApp, setSelectedApp] = useState("")
    const { isAdmin } = useUser()

    useEffect(() => {
        Api().get('/cloudflare/config')
            .then(response => setEnabled(response?.data?.status === true))
            .catch(() => setEnabled(false))

        Api().get('/apps')
            .then(response => setApps(Array.isArray(response.data?.data) ? response.data.data : []))
            .catch(error => console.error(error))
    }, [])

    useEffect(() => {
        if (!enabled) {
            setLoading(false)
            return
        }
        setLoading(true)
        Promise.all([Api().get('/cloudflare/routes'), Api().get('/cloudflare/dns')])
            .then(([routesResponse, dnsResponse]) => {
                setRoutes(routesResponse?.data?.data || [])
                setRecords(dnsResponse?.data?.data || [])
            })
            .catch(error => {
                toast.error(error?.response?.data?.message || 'Could not talk to cloudflare. Better luck next time...')
            })
            .finally(() => setLoading(false))
    }, [enabled, refresh])

    function removeHostname(hostname: string, dns = removeDNS) {
        if (!confirm(`Remove ${hostname} from the tunnel?`)) return
        const removing = toast.loading('Removing ' + hostname + '...')
        Api().delete(`/cloudflare/hostname/${encodeURIComponent(hostname)}?dns=${dns}`)
            .then(() => {
                toast.success(hostname + ' removed')
                setRefresh(prev => prev + 1)
            })
            .catch(error => {
                toast.error(error?.response?.data?.message || 'Could not remove it. Better luck next time...')
            })
            .finally(() => toast.dismiss(removing))
    }

    function addHostname(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const data = {
            hostname: (form.elements.namedItem('hostname') as HTMLInputElement).value,
            port: (form.elements.namedItem('port') as HTMLInputElement).value,
            appId: selectedApp,
        }
        const adding = toast.loading('Creating ' + data.hostname + '...')
        Api().post('/cloudflare/hostname', data)
            .then(() => {
                toast.success(data.hostname + ' created')
                form.reset()
                setSelectedApp("")
                setRefresh(prev => prev + 1)
            })
            .catch(error => {
                toast.error(error?.response?.data?.message || 'Could not create it. Better luck next time...')
            })
            .finally(() => toast.dismiss(adding))
    }

    const routedHosts = routes.map(r => r.hostname)
    const orphans = records.filter(r => r.managedByTunnel && !routedHosts.includes(r.name))
    const app = apps.find(a => a.id === selectedApp)

    if (enabled === null || loading) {
        return <Loader />
    }

    if (!enabled) {
        return (
            <div className='p-8 text-center text-gray-400'>
                Cloudflare is not configured yet. Go to <a href='/config' className='text-[#b3078b] underline'>Config</a> and set it up.
            </div>
        )
    }

    return (
        <div className='p-4 md:p-8 grid gap-8 max-w-5xl mx-auto w-full'>
            <h1 className='text-3xl font-bold text-center mb-2 tracking-tight'>Cloudflare</h1>

            <div className='w-full overflow-x-auto rounded-xl border border-zinc-800 bg-[#0d0d0d]'>
                <div className='flex justify-between items-center p-3 bg-[#141414] border-b border-[#b3078b]/30'>
                    <h2 className='text-sm font-semibold uppercase tracking-wider text-gray-400'>Tunnel routes</h2>
                    <label className='text-xs text-gray-400 flex items-center gap-2 cursor-pointer'>
                        <input type='checkbox' checked={removeDNS} onChange={e => setRemoveDNS(e.target.checked)} />
                        also delete dns when removing
                    </label>
                </div>
                <table className='w-full border-collapse text-left text-sm text-zinc-300'>
                    <thead className='text-xs uppercase tracking-wider text-gray-500'>
                        <tr>
                            <th className='py-2 px-4'>Hostname</th>
                            <th className='py-2 px-4'>Service</th>
                            <th className='py-2 px-4'>App</th>
                            <th className='py-2 px-4'>DNS</th>
                            <th className='py-2 px-4'></th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-zinc-800/40'>
                        {routes.length === 0 && (
                            <tr><td colSpan={5} className='py-6 text-center text-gray-500'>No routes in this tunnel</td></tr>
                        )}
                        {routes.map(route => (
                            <tr key={route.hostname} className='hover:bg-zinc-900/30 transition-colors'>
                                <td className='py-2 px-4'>
                                    <a href={'https://' + route.hostname} target='_blank' rel='noopener noreferrer' className='text-blue-400 hover:underline'>{route.hostname}</a>
                                    {route.managed && <span className='ml-2 px-1.5 py-0.5 rounded text-[10px] bg-[#b3078b]/10 text-[#e04fbf] border border-[#b3078b]/30'>front desk</span>}
                                </td>
                                <td className='py-2 px-4 font-mono text-xs'>{route.service}</td>
                                <td className='py-2 px-4'>{route.appName || <span className='text-gray-600'>-</span>}</td>
                                <td className='py-2 px-4'>{route.dnsRecord ? <span className='text-emerald-400'>✓</span> : <span className='text-red-400' title='No CNAME for this hostname'>✗</span>}</td>
                                <td className='py-2 px-4 text-right'>
                                    {isAdmin && <>
                                    <Button id={'remove_' + route.hostname} role='generic' type='button' onClick={() => removeHostname(route.hostname)} className='p-1 text-red-500 hover:text-red-400' title='Remove'>
                                        <Trash2 className='h-4 w-4' />
                                    </Button>
                                    </>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAdmin && (
            <div className='p-6 border border-[#960675] rounded-md bg-black'>
                <h2 className='text-lg text-center font-semibold mb-4 text-gray-100'>Add hostname</h2>
                <form className='grid gap-4' onSubmit={addHostname}>
                    <select className={inputClass} value={selectedApp} onChange={e => setSelectedApp(e.target.value)}>
                        <option value=''>No app, just a port</option>
                        {apps.map(a => <option key={a.id} value={a.id}>{a.name || a.id.slice(0, 12)}</option>)}
                    </select>
                    <input id='hostname' type='text' placeholder='app.yourdomain.com' className={inputClass} required />
                    <input id='port' type='number' placeholder={app?.cloudflarePort ? `Port (${app.cloudflarePort} from the app label)` : 'Port'} className={inputClass} required={!app?.cloudflarePort} />
                    <Button type='submit' id='addHostname' role='action' className='p-2.5 mt-2 rounded-md font-medium'>Create</Button>
                </form>
            </div>
            )}

            {isAdmin && orphans.length > 0 && (
                <div className='p-6 border border-amber-500/40 rounded-md bg-black'>
                    <h2 className='text-lg font-semibold mb-2 text-amber-400'>Orphan DNS records</h2>
                    <p className='text-xs text-gray-400 mb-4'>These point to your tunnel but the tunnel has no route for them anymore</p>
                    <ul className='grid gap-2 text-sm'>
                        {orphans.map(record => (
                            <li key={record.id} className='flex justify-between items-center'>
                                <span className='font-mono'>{record.name}</span>
                                <Button id={'orphan_' + record.id} role='cancel' type='button' onClick={() => removeHostname(record.name, true)} className='rounded'>
                                    Delete
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
