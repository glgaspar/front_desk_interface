"use client"
import React, { useEffect, useState } from 'react'
import Api from '@/Components/Api'
import toast from 'react-hot-toast'
import Button from '@/Components/Button'
import { NotificationChannel } from '@/app/monitoring/Interfaces'

const inputClass = 'w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all'

type ChannelType = NotificationChannel["type"]

// what each type needs, the secret ones come back as ******** from the api
const fields: Record<ChannelType, { key: string, placeholder: string, secret?: boolean, optional?: boolean }[]> = {
    ntfy: [
        { key: 'url', placeholder: 'Topic url (https://ntfy.sh/my-topic)' },
        { key: 'token', placeholder: 'Access token', secret: true, optional: true },
    ],
    discord: [
        { key: 'url', placeholder: 'Webhook url', secret: true },
    ],
    telegram: [
        { key: 'token', placeholder: 'Bot token', secret: true },
        { key: 'chatId', placeholder: 'Chat id' },
    ],
    webhook: [
        { key: 'url', placeholder: 'Url' },
        { key: 'header', placeholder: 'Header name (optional)', optional: true },
        { key: 'value', placeholder: 'Header value', secret: true, optional: true },
    ],
}

const empty: NotificationChannel = { id: 0, name: '', type: 'ntfy', config: {}, events: ['down', 'up'], enabled: true }

export default function Notifications() {
    const [channels, setChannels] = useState<NotificationChannel[]>([])
    const [editing, setEditing] = useState<NotificationChannel>(empty)
    const [refresh, setRefresh] = useState(0)

    useEffect(() => {
        Api().get('/notifications')
            .then(response => setChannels(response?.data?.data || []))
            .catch(error => {
                console.error(error)
                toast.error('Could not load notification channels')
            })
    }, [refresh])

    function save(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const request = editing.id
            ? Api().put(`/notifications/${editing.id}`, editing)
            : Api().post('/notifications', editing)
        request
            .then(() => {
                toast.success(editing.id ? 'Channel updated' : 'Channel created')
                setEditing(empty)
                setRefresh(prev => prev + 1)
            })
            .catch(error => toast.error(error?.response?.data?.message || 'Could not save it. Better luck next time...'))
    }

    function toggle(channel: NotificationChannel) {
        Api().put(`/notifications/${channel.id}`, { ...channel, enabled: !channel.enabled })
            .then(() => setRefresh(prev => prev + 1))
            .catch(error => toast.error(error?.response?.data?.message || 'Could not update it'))
    }

    function remove(channel: NotificationChannel) {
        if (!confirm(`Delete ${channel.name}?`)) return
        Api().delete(`/notifications/${channel.id}`)
            .then(() => setRefresh(prev => prev + 1))
            .catch(error => toast.error(error?.response?.data?.message || 'Could not delete it'))
    }

    function test(channel: NotificationChannel) {
        const sending = toast.loading('Sending...')
        Api().post(`/notifications/${channel.id}/test`)
            .then(() => toast.success('Sent, go check it'))
            .catch(error => toast.error(error?.response?.data?.message || 'It did not work'))
            .finally(() => toast.dismiss(sending))
    }

    function toggleEvent(event: string) {
        setEditing(prev => ({
            ...prev,
            events: prev.events.includes(event) ? prev.events.filter(e => e !== event) : [...prev.events, event],
        }))
    }

    return (
        <div className='p-6 border border-[#960675] rounded-md bg-black shadow-sm backdrop-blur-sm'>
            <h2 className='text-lg text-center font-semibold mb-4 text-gray-100'>Notifications</h2>

            {channels.length > 0 && (
                <ul className='grid gap-2 mb-6 text-sm'>
                    {channels.map(channel => (
                        <li key={channel.id} className='flex flex-wrap justify-between items-center gap-2 p-2 border border-zinc-800 rounded-md'>
                            <span className={channel.enabled ? 'text-white' : 'text-gray-500 line-through'}>
                                {channel.name} <span className='text-xs text-gray-500'>({channel.type} · {channel.events.join(', ')})</span>
                            </span>
                            <span className='flex gap-2'>
                                <Button id={'test_' + channel.id} role='option' type='button' onClick={() => test(channel)}>Test</Button>
                                <Button id={'toggle_' + channel.id} role='option' type='button' onClick={() => toggle(channel)}>{channel.enabled ? 'Disable' : 'Enable'}</Button>
                                <Button id={'edit_' + channel.id} role='option' type='button' onClick={() => setEditing(channel)}>Edit</Button>
                                <Button id={'delete_' + channel.id} role='cancel' type='button' onClick={() => remove(channel)}>Delete</Button>
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <form className='grid gap-4' onSubmit={save}>
                <input type='text' placeholder='Name' className={inputClass} value={editing.name} onChange={e => setEditing(prev => ({ ...prev, name: e.target.value }))} required />
                <select className={inputClass} value={editing.type} onChange={e => setEditing(prev => ({ ...prev, type: e.target.value as ChannelType, config: {} }))}>
                    <option value='ntfy'>ntfy</option>
                    <option value='discord'>Discord</option>
                    <option value='telegram'>Telegram</option>
                    <option value='webhook'>Webhook</option>
                </select>
                {fields[editing.type].map(field => (
                    <input
                        key={editing.type + field.key}
                        type={field.secret ? 'password' : 'text'}
                        placeholder={field.placeholder + (editing.id && field.secret ? ' (leave it to keep)' : '')}
                        className={inputClass}
                        value={editing.config[field.key] || ''}
                        onChange={e => setEditing(prev => ({ ...prev, config: { ...prev.config, [field.key]: e.target.value } }))}
                        required={!field.optional && !(editing.id && field.secret)}
                    />
                ))}
                <div className='flex gap-4 text-sm text-gray-300'>
                    {['down', 'up'].map(event => (
                        <label key={event} className='flex items-center gap-2 cursor-pointer'>
                            <input type='checkbox' checked={editing.events.includes(event)} onChange={() => toggleEvent(event)} />
                            when an app goes {event}
                        </label>
                    ))}
                </div>
                <div className='flex gap-2'>
                    {editing.id !== 0 && (
                        <Button id='cancelChannel' role='cancel' type='button' onClick={() => setEditing(empty)} className='flex-1 p-2.5 mt-2 rounded-md'>Cancel</Button>
                    )}
                    <Button type='submit' id='saveChannel' role='action' className='flex-1 p-2.5 mt-2 rounded-md font-medium'>{editing.id ? 'Save' : 'Add channel'}</Button>
                </div>
            </form>
        </div>
    )
}
