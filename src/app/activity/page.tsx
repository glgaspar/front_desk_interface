"use client"
import React, { useEffect, useState } from 'react'
import Api from '@/Components/Api'
import toast from 'react-hot-toast'
import Button from '@/Components/Button'
import Loader from '@/Components/Loader'
import { CurrentUser, useUser } from '@/Components/User'

interface Entry {
    id: number
    userId: number | null
    userName: string
    action: string
    target: string
    status: number | null
    ip: string
    createdAt: string
}

const inputClass = 'p-2 rounded-lg bg-black border border-zinc-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#b3078b] transition-all'

function query(user: string, action: string, before?: number) {
    const params = new URLSearchParams()
    if (user) params.set('user', user)
    if (action) params.set('action', action)
    if (before) params.set('before', String(before))
    params.set('limit', '100')
    return '/activity?' + params.toString()
}

export default function Activity() {
    const { isAdmin } = useUser()
    const [entries, setEntries] = useState<Entry[] | null>(null)
    const [users, setUsers] = useState<CurrentUser[]>([])
    const [user, setUser] = useState('')
    const [action, setAction] = useState('')
    const [search, setSearch] = useState('')
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        if (!isAdmin) return
        Api().get('/users')
            .then(response => setUsers(response?.data?.data || []))
            .catch(error => console.error(error))
    }, [isAdmin])

    // waits a bit after typing so it doesnt ask the api on every key
    useEffect(() => {
        const timeout = setTimeout(() => setAction(search.trim()), 400)
        return () => clearTimeout(timeout)
    }, [search])

    useEffect(() => {
        function load() {
            if (document.hidden) return
            Api().get(query(user, action))
                .then(response => {
                    const list: Entry[] = response?.data?.data || []
                    // only the first page refreshes, whatever was loaded with "load more" stays
                    setEntries(prev => {
                        if (!prev || prev.length <= 100) return list
                        const newest = list.filter(e => !prev.some(p => p.id === e.id))
                        return [...newest, ...prev]
                    })
                })
                .catch(error => {
                    setEntries([])
                    toast.error(error?.response?.data?.message || 'Could not load the activity')
                })
        }
        setEntries(null)
        setHasMore(true)
        load()
        const interval = setInterval(load, 30000)
        return () => clearInterval(interval)
    }, [user, action])

    function loadMore() {
        if (!entries?.length) return
        Api().get(query(user, action, entries[entries.length - 1].id))
            .then(response => {
                const list: Entry[] = response?.data?.data || []
                setHasMore(list.length === 100)
                setEntries(prev => [...(prev || []), ...list])
            })
            .catch(error => toast.error(error?.response?.data?.message || 'Could not load more'))
    }

    return (
        <div className='p-4 md:p-8 grid gap-6 max-w-6xl mx-auto w-full'>
            <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
                <h1 className='text-3xl font-bold tracking-tight'>Activity</h1>
                <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
                    {isAdmin && (
                        <select className={inputClass} value={user} onChange={e => setUser(e.target.value)}>
                            <option value=''>Everyone</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.userName}</option>)}
                        </select>
                    )}
                    <input type='text' placeholder='Search action or target...' className={inputClass} value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className='w-full overflow-x-auto rounded-xl border border-zinc-800 bg-[#0d0d0d]'>
                <table className='w-full border-collapse text-left text-sm text-zinc-300'>
                    <thead className='bg-[#141414] border-b border-[#b3078b]/30 text-xs uppercase tracking-wider text-gray-400'>
                        <tr>
                            <th className='py-3 px-4'>When</th>
                            <th className='py-3 px-4'>Who</th>
                            <th className='py-3 px-4'>What</th>
                            <th className='py-3 px-4'>On</th>
                            <th className='py-3 px-4'>Result</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-zinc-800/40'>
                        {!entries && <tr><td colSpan={5}><Loader /></td></tr>}
                        {entries?.length === 0 && <tr><td colSpan={5} className='py-8 text-center text-gray-500'>Nothing here yet</td></tr>}
                        {entries?.map(entry => (
                            <tr key={entry.id} className='hover:bg-zinc-900/30 transition-colors'>
                                <td className='py-2 px-4 text-xs text-gray-400 whitespace-nowrap'>{new Date(entry.createdAt).toLocaleString()}</td>
                                <td className='py-2 px-4 font-medium text-white' title={entry.ip}>{entry.userName || '-'}</td>
                                <td className='py-2 px-4'>{entry.action}</td>
                                <td className='py-2 px-4 font-mono text-xs text-gray-400 break-all'>{entry.target || '-'}</td>
                                <td className='py-2 px-4'>
                                    {entry.status == null ? <span className='text-gray-600'>-</span> : (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-mono border ${entry.status >= 400 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                            {entry.status}
                                        </span>
                                    )}
                                    {entry.action === 'failed login' && <span className='px-2 py-0.5 rounded-full text-xs border bg-red-500/10 text-red-400 border-red-500/20'>failed</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {entries && entries.length >= 100 && hasMore && (
                <Button id='loadMore' role='switch' type='button' onClick={loadMore} className='justify-self-center rounded px-4 py-2'>Load more</Button>
            )}
        </div>
    )
}
