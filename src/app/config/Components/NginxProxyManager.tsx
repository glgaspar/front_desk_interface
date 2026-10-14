"use client"
import React, { useEffect, useState } from 'react'
import Api from '@/Components/Api'
import toast from 'react-hot-toast'
import Button from '@/Components/Button'
import { NPMCertificate, NPMConfig, certificateLabel } from '@/app/proxy/Interfaces'

const inputClass = 'w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all'

const empty: NPMConfig = { url: '', email: '', password: '', forwardHost: '', defaultCertificateId: 0 }

export default function NginxProxyManager() {
    const [enabled, setEnabled] = useState(false)
    const [config, setConfig] = useState<NPMConfig>(empty)
    const [certificates, setCertificates] = useState<NPMCertificate[]>([])
    const [refresh, setRefresh] = useState(0)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        Api().get('/npm/config')
            .then(response => {
                setEnabled(response?.data?.status === true)
                if (response?.data?.data) setConfig({ ...response.data.data, password: '' })
                if (response?.data?.status === true) {
                    Api().get('/npm/certificates')
                        .then(res => setCertificates(res?.data?.data || []))
                        .catch(error => console.error(error))
                }
            })
            .catch(error => {
                console.error('There was an error!', error);
                toast.error('Could not retrieve nginx proxy manager configuration. Please try again.')
            })
    }, [refresh])

    function save(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSaving(true)
        const loading = toast.loading('Setting up nginx proxy manager...')
        Api().post('/npm/config', config)
            .then(() => {
                toast.success('Nginx Proxy Manager setup successfully!')
                setRefresh(prev => prev + 1)
            })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Nginx Proxy Manager setup failed. Please try again.')
            })
            .finally(() => {
                toast.dismiss(loading)
                setSaving(false)
            })
    }

    function set(key: keyof NPMConfig, value: string | number) {
        setConfig(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className='p-6 border border-[#960675] rounded-md bg-black shadow-sm backdrop-blur-sm'>
            <div className='flex items-center justify-center mb-4'>
                <h2 className='text-lg font-semibold text-gray-100'>Nginx Proxy Manager</h2>
                {enabled ? <span className='absolute right-8 text-green-400 text-xs font-medium px-2.5 py-1 bg-green-500/10 rounded-md border border-green-500'>Configured</span> : <span className='absolute right-8 text-red-400 text-xs font-medium px-2.5 py-1 bg-red-500/10 rounded-md border border-red-500'>Not Configured</span>}
            </div>
            <form className='grid gap-4' onSubmit={save}>
                <input type="text" placeholder='Url (http://192.168.0.10:81)' className={inputClass} value={config.url} onChange={e => set('url', e.target.value)} required/>
                <input type="email" placeholder='Email' className={inputClass} value={config.email} onChange={e => set('email', e.target.value)} required/>
                <input type="password" placeholder={config.passwordSet ? 'Password (unchanged)' : 'Password'} className={inputClass} value={config.password} onChange={e => set('password', e.target.value)} required={!config.passwordSet}/>
                <input type="text" placeholder='Forward host, where your apps run (192.168.0.10)' className={inputClass} value={config.forwardHost} onChange={e => set('forwardHost', e.target.value)} required/>
                {enabled && (
                    <select className={inputClass} value={config.defaultCertificateId} onChange={e => set('defaultCertificateId', Number(e.target.value))}>
                        <option value={0}>No certificate by default (http only)</option>
                        {certificates.map(cert => <option key={cert.id} value={cert.id}>{certificateLabel(cert)}</option>)}
                    </select>
                )}
                <Button type='submit' id='setupNPM' role='action' className='p-2.5 mt-2 rounded-md font-medium' disabled={saving}>Submit</Button>
            </form>
        </div>
    )
}
