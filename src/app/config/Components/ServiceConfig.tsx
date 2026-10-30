"use client"
import React, { useEffect, useState } from 'react'
import Api from '@/Components/Api'
import toast from 'react-hot-toast'
import Button from '@/Components/Button'

const inputClass = 'w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all'

// a field is only shown when it has a placeholder
interface Fields {
    url?: string
    username?: string
    secret?: string
    extra?: string
    secretOptional?: boolean
}

interface Config {
    url: string
    username: string
    secret: string
    extra: string
    secretSet?: boolean
}

// the integrations that are just an url and a key all share this form and the same endpoint
export default function ServiceConfig({ name, title, fields }: { name: string, title: string, fields: Fields }) {
    const [enabled, setEnabled] = useState(false)
    const [config, setConfig] = useState<Config>({ url: '', username: '', secret: '', extra: '' })
    const [saving, setSaving] = useState(false)
    const [refresh, setRefresh] = useState(0)

    useEffect(() => {
        Api().get(`/services/${name}/config`)
            .then(response => {
                setEnabled(response?.data?.status === true)
                if (response?.data?.data) setConfig({ ...response.data.data, secret: '' })
            })
            .catch(error => console.error(error))
    }, [name, refresh])

    function save(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSaving(true)
        const loading = toast.loading(`Setting up ${title}...`)
        Api().post(`/services/${name}/config`, config)
            .then(() => toast.success(`${title} setup successfully!`))
            .catch(error => toast.error(error.response?.data?.message || `${title} setup failed. Please try again.`))
            .finally(() => {
                toast.dismiss(loading)
                setSaving(false)
                setRefresh(prev => prev + 1)
            })
    }

    function set(key: keyof Config, value: string) {
        setConfig(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className='p-6 border border-[#960675] rounded-md bg-black shadow-sm backdrop-blur-sm'>
            <div className='flex items-center justify-center mb-4'>
                <h2 className='text-lg font-semibold text-gray-100'>{title}</h2>
                {enabled ? <span className='absolute right-8 text-green-400 text-xs font-medium px-2.5 py-1 bg-green-500/10 rounded-md border border-green-500'>Configured</span> : <span className='absolute right-8 text-red-400 text-xs font-medium px-2.5 py-1 bg-red-500/10 rounded-md border border-red-500'>Not Configured</span>}
            </div>
            <form className='grid gap-4' onSubmit={save}>
                {fields.url && <input type="text" placeholder={fields.url} className={inputClass} value={config.url} onChange={e => set('url', e.target.value)} required />}
                {fields.username && <input type="text" placeholder={fields.username} className={inputClass} value={config.username} onChange={e => set('username', e.target.value)} />}
                {fields.secret && <input type="password" placeholder={config.secretSet ? fields.secret + ' (unchanged)' : fields.secret} className={inputClass} value={config.secret} onChange={e => set('secret', e.target.value)} required={!config.secretSet && !fields.secretOptional} />}
                {fields.extra && <input type="text" placeholder={fields.extra} className={inputClass} value={config.extra} onChange={e => set('extra', e.target.value)} />}
                <Button type='submit' id={'setup_' + name} role='action' className='p-2.5 mt-2 rounded-md font-medium' disabled={saving}>Submit</Button>
            </form>
        </div>
    )
}
