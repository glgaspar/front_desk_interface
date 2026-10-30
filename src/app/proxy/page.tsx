"use client"
import React, { useEffect, useState } from 'react'
import Api from '@/Components/Api'
import toast from 'react-hot-toast'
import Button from '@/Components/Button'
import Loader from '@/Components/Loader'
import App from '../home/Interfaces/Apps'
import { NPMCertificate, NPMHost, PiholeDns, certificateLabel } from './Interfaces'
import { Lock, LockOpen, Plus, Trash2 } from 'lucide-react'
import { useUser } from '@/Components/User'

const inputClass = 'w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all'
const smallSelect = 'max-w-[14rem] p-1 rounded bg-black border border-zinc-700 text-xs text-white focus:outline-none focus:border-[#b3078b]'

export default function Proxy() {
    const [enabled, setEnabled] = useState<boolean | null>(null)
    const [defaultCert, setDefaultCert] = useState(0)
    const [hosts, setHosts] = useState<NPMHost[]>([])
    const [certificates, setCertificates] = useState<NPMCertificate[]>([])
    const [apps, setApps] = useState<App[]>([])
    const [loading, setLoading] = useState(true)
    const [refresh, setRefresh] = useState(0)
    const [selectedApp, setSelectedApp] = useState("")
    const [newCert, setNewCert] = useState(0)
    const [dns, setDns] = useState<PiholeDns | null>(null)
    const { isAdmin } = useUser()

    useEffect(() => {
        Api().get('/npm/config')
            .then(response => {
                setEnabled(response?.data?.status === true)
                setDefaultCert(response?.data?.data?.defaultCertificateId || 0)
                setNewCert(response?.data?.data?.defaultCertificateId || 0)
            })
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
        // pihole is optional here, the page works the same without it
        Api().get('/services/pihole/config')
            .then(response => {
                if (response?.data?.status !== true) return setDns(null)
                return Api().get('/pihole/dns').then(res => setDns(res?.data?.data || null))
            })
            .catch(error => toast.error(error?.response?.data?.message || 'Could not talk to pihole'))

        Promise.all([Api().get('/npm/hosts'), Api().get('/npm/certificates')])
            .then(([hostsResponse, certsResponse]) => {
                setHosts(hostsResponse?.data?.data || [])
                setCertificates(certsResponse?.data?.data || [])
            })
            .catch(error => {
                toast.error(error?.response?.data?.message || 'Could not talk to nginx proxy manager. Better luck next time...')
            })
            .finally(() => setLoading(false))
    }, [enabled, refresh])

    function changeCertificate(host: NPMHost, certificateId: number) {
        const saving = toast.loading('Updating certificate...')
        Api().put(`/npm/hosts/${host.id}/certificate`, { certificateId })
            .then(() => {
                toast.success(certificateId ? 'Certificate updated' : 'SSL removed')
                setRefresh(prev => prev + 1)
            })
            .catch(error => toast.error(error?.response?.data?.message || 'Could not change it. Better luck next time...'))
            .finally(() => toast.dismiss(saving))
    }

    function removeHost(host: NPMHost) {
        if (!confirm(`Remove ${host.domain_names.join(', ')} from nginx proxy manager?`)) return
        const removing = toast.loading('Removing...')
        Api().delete(`/npm/hosts/${host.id}`)
            .then(() => {
                toast.success('Proxy host removed')
                setRefresh(prev => prev + 1)
            })
            .catch(error => toast.error(error?.response?.data?.message || 'Could not remove it. Better luck next time...'))
            .finally(() => toast.dismiss(removing))
    }

    function addDns(hostname: string) {
        const adding = toast.loading('Adding ' + hostname + ' to pihole...')
        Api().post('/pihole/dns', { hostname })
            .then(() => {
                toast.success(hostname + ' resolves to ' + dns?.lanIp + ' on the LAN now')
                setRefresh(prev => prev + 1)
            })
            .catch(error => toast.error(error?.response?.data?.message || 'Could not add it. Better luck next time...'))
            .finally(() => toast.dismiss(adding))
    }

    function removeDns(hostname: string) {
        if (!confirm(`Remove ${hostname} from pihole local dns?`)) return
        const removing = toast.loading('Removing...')
        Api().delete(`/pihole/dns/${encodeURIComponent(hostname)}`)
            .then(() => {
                toast.success(hostname + ' removed from pihole')
                setRefresh(prev => prev + 1)
            })
            .catch(error => toast.error(error?.response?.data?.message || 'Could not remove it. Better luck next time...'))
            .finally(() => toast.dismiss(removing))
    }

    function addHost(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const data = {
            hostname: (form.elements.namedItem('hostname') as HTMLInputElement).value,
            port: (form.elements.namedItem('port') as HTMLInputElement).value,
            appId: selectedApp,
            certificateId: newCert,
        }
        const adding = toast.loading('Creating ' + data.hostname + '...')
        Api().post('/npm/hosts', data)
            .then(() => {
                toast.success(data.hostname + ' created')
                form.reset()
                setSelectedApp("")
                setNewCert(defaultCert)
                setRefresh(prev => prev + 1)
            })
            .catch(error => toast.error(error?.response?.data?.message || 'Could not create it. Better luck next time...'))
            .finally(() => toast.dismiss(adding))
    }

    // records pointing to the npm box that no proxy host uses anymore
    const domains = new Set(hosts.flatMap(h => h.domain_names.map(d => d.toLowerCase())))
    const staleDns = dns?.records.filter(r => r.ip === dns.lanIp && !domains.has(r.hostname.toLowerCase())) || []

    function dnsCell(domain: string) {
        const record = dns?.records.find(r => r.hostname.toLowerCase() === domain.toLowerCase())
        if (record?.ip === dns?.lanIp) return <span key={domain} className='block text-emerald-400'>{record?.ip}</span>
        if (record) return <span key={domain} className='block text-amber-400' title='Points somewhere else than the LAN ip from the config'>{record.ip}</span>
        if (!isAdmin) return <span key={domain} className='block text-gray-600'>-</span>
        return (
            <Button key={domain} id={'dns_' + domain} role='generic' type='button' onClick={() => addDns(domain)} className='flex items-center gap-1 text-xs text-gray-400 hover:text-[#e04fbf]' title={'Point ' + domain + ' to ' + dns?.lanIp}>
                <Plus className='h-3 w-3' /> add
            </Button>
        )
    }

    const app = apps.find(a => a.id === selectedApp)
    const appPort = app?.port || app?.cloudflarePort

    if (enabled === null || loading) {
        return <Loader />
    }

    if (!enabled) {
        return (
            <div className='p-8 text-center text-gray-400'>
                Nginx Proxy Manager is not configured yet. Go to <a href='/config' className='text-[#b3078b] underline'>Config</a> and set it up.
            </div>
        )
    }

    return (
        <div className='p-4 md:p-8 grid gap-8 max-w-5xl mx-auto w-full'>
            <h1 className='text-3xl font-bold text-center mb-2 tracking-tight'>Proxy</h1>

            <div className='w-full overflow-x-auto rounded-xl border border-zinc-800 bg-[#0d0d0d]'>
                <div className='p-3 bg-[#141414] border-b border-[#b3078b]/30'>
                    <h2 className='text-sm font-semibold uppercase tracking-wider text-gray-400'>Proxy hosts</h2>
                </div>
                <table className='w-full border-collapse text-left text-sm text-zinc-300'>
                    <thead className='text-xs uppercase tracking-wider text-gray-500'>
                        <tr>
                            <th className='py-2 px-4'>Domains</th>
                            <th className='py-2 px-4'>Forward</th>
                            <th className='py-2 px-4'>App</th>
                            <th className='py-2 px-4'>Certificate</th>
                            {dns && <th className='py-2 px-4'>LAN DNS</th>}
                            <th className='py-2 px-4'></th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-zinc-800/40'>
                        {hosts.length === 0 && (
                            <tr><td colSpan={dns ? 6 : 5} className='py-6 text-center text-gray-500'>No proxy hosts yet</td></tr>
                        )}
                        {hosts.map(host => (
                            <tr key={host.id} className='hover:bg-zinc-900/30 transition-colors'>
                                <td className='py-2 px-4'>
                                    {host.domain_names.map(domain => (
                                        <a key={domain} href={(host.certificate_id ? 'https://' : 'http://') + domain} target='_blank' rel='noopener noreferrer' className='block text-blue-400 hover:underline break-all'>{domain}</a>
                                    ))}
                                    {host.managed && <span className='px-1.5 py-0.5 rounded text-[10px] bg-[#b3078b]/10 text-[#e04fbf] border border-[#b3078b]/30'>front desk</span>}
                                </td>
                                <td className='py-2 px-4 font-mono text-xs'>{host.forward_scheme}://{host.forward_host}:{host.forward_port}</td>
                                <td className='py-2 px-4'>{host.appName || <span className='text-gray-600'>-</span>}</td>
                                <td className='py-2 px-4'>
                                    <span className='flex items-center gap-2'>
                                        {host.certificate_id
                                            ? <Lock className='h-3.5 w-3.5 text-emerald-400 shrink-0' />
                                            : <LockOpen className='h-3.5 w-3.5 text-gray-500 shrink-0' />}
                                        <select className={smallSelect} disabled={!isAdmin} value={host.certificate_id || 0} onChange={e => changeCertificate(host, Number(e.target.value))}>
                                            <option value={0}>None</option>
                                            {certificates.map(cert => <option key={cert.id} value={cert.id}>{certificateLabel(cert)}</option>)}
                                        </select>
                                    </span>
                                </td>
                                {dns && <td className='py-2 px-4 font-mono text-xs'>{host.domain_names.map(dnsCell)}</td>}
                                <td className='py-2 px-4 text-right'>
                                    {isAdmin && <>
                                    <Button id={'remove_' + host.id} role='generic' type='button' onClick={() => removeHost(host)} className='p-1 text-red-500 hover:text-red-400' title='Remove'>
                                        <Trash2 className='h-4 w-4' />
                                    </Button>
                                    </>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {staleDns.length > 0 && (
                <div className='w-full rounded-xl border border-zinc-800 bg-[#0d0d0d]'>
                    <div className='p-3 bg-[#141414] border-b border-[#b3078b]/30'>
                        <h2 className='text-sm font-semibold uppercase tracking-wider text-gray-400'>Pi-hole records with no proxy host</h2>
                    </div>
                    <ul className='divide-y divide-zinc-800/40 text-sm text-zinc-300'>
                        {staleDns.map(r => (
                            <li key={r.hostname} className='flex justify-between items-center py-2 px-4'>
                                <span className='break-all'>{r.hostname} <span className='font-mono text-xs text-gray-500'>{r.ip}</span></span>
                                {isAdmin && (
                                    <Button id={'remove_dns_' + r.hostname} role='generic' type='button' onClick={() => removeDns(r.hostname)} className='p-1 text-red-500 hover:text-red-400' title='Remove from pihole'>
                                        <Trash2 className='h-4 w-4' />
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {isAdmin && (
            <div className='p-6 border border-[#960675] rounded-md bg-black'>
                <h2 className='text-lg text-center font-semibold mb-4 text-gray-100'>Add proxy host</h2>
                <form className='grid gap-4' onSubmit={addHost}>
                    <select className={inputClass} value={selectedApp} onChange={e => setSelectedApp(e.target.value)}>
                        <option value=''>No app, just a port</option>
                        {apps.map(a => <option key={a.id} value={a.id}>{a.name || a.id.slice(0, 12)}</option>)}
                    </select>
                    <input id='hostname' type='text' placeholder='app.yourdomain.com' className={inputClass} required />
                    <input id='port' type='number' placeholder={appPort ? `Port (${appPort} from the app label)` : 'Port'} className={inputClass} required={!appPort} />
                    <select className={inputClass} value={newCert} onChange={e => setNewCert(Number(e.target.value))}>
                        <option value={0}>No certificate (http only)</option>
                        {certificates.map(cert => <option key={cert.id} value={cert.id}>{certificateLabel(cert)}</option>)}
                    </select>
                    <Button type='submit' id='addProxyHost' role='action' className='p-2.5 mt-2 rounded-md font-medium'>Create</Button>
                </form>
            </div>
            )}
        </div>
    )
}
