"use client"
import React, { useEffect, useState } from 'react'
import Api from '@/Components/Api'
import toast from 'react-hot-toast'
import Button from '@/Components/Button'
import Loader from '@/Components/Loader'
import { CurrentUser, useUser } from '@/Components/User'
import { Pencil, Trash2 } from 'lucide-react'

const inputClass = 'w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all'

interface Editing {
    id: number
    userName: string
    password: string
    currentPassword: string
}

export default function Users() {
    const { user: me, isAdmin, refresh: refreshMe } = useUser()
    const [users, setUsers] = useState<CurrentUser[] | null>(null)
    const [editing, setEditing] = useState<Editing | null>(null)
    const [refresh, setRefresh] = useState(0)

    useEffect(() => {
        Api().get('/users')
            .then(response => setUsers(response?.data?.data || []))
            .catch(error => {
                setUsers([])
                toast.error(error?.response?.data?.message || 'Could not load users')
            })
    }, [refresh])

    function startEditing(user: CurrentUser) {
        setEditing({ id: user.id, userName: user.userName, password: '', currentPassword: '' })
    }

    function save(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!editing) return
        const original = users?.find(u => u.id === editing.id)
        const data = {
            userName: editing.userName !== original?.userName ? editing.userName : '',
            password: editing.password,
            currentPassword: editing.currentPassword,
        }
        if (!data.userName && !data.password) {
            setEditing(null)
            return
        }

        const saving = toast.loading('Saving...')
        Api().put(`/users/${editing.id}`, data)
            .then(() => {
                toast.success('User updated')
                setEditing(null)
                setRefresh(prev => prev + 1)
                if (editing.id === me?.id) refreshMe()
            })
            .catch(error => toast.error(error?.response?.data?.message || 'Could not save it. Better luck next time...'))
            .finally(() => toast.dismiss(saving))
    }

    function toggleAdmin(user: CurrentUser) {
        Api().put(`/users/${user.id}/admin`, { isAdmin: !user.isAdmin })
            .then(() => {
                toast.success(user.isAdmin ? `${user.userName} is not an admin anymore` : `${user.userName} is an admin now`)
                setRefresh(prev => prev + 1)
                if (user.id === me?.id) refreshMe()
            })
            .catch(error => toast.error(error?.response?.data?.message || 'Could not change it'))
    }

    function remove(user: CurrentUser) {
        if (!confirm(`Delete ${user.userName}? They will be logged out right away.`)) return
        Api().delete(`/users/${user.id}`)
            .then(() => {
                toast.success(user.userName + ' removed')
                setRefresh(prev => prev + 1)
            })
            .catch(error => toast.error(error?.response?.data?.message || 'Could not delete it'))
    }

    function createUser(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const data = {
            userName: (form.elements.namedItem('newUserName') as HTMLInputElement).value,
            password: (form.elements.namedItem('newPassword') as HTMLInputElement).value,
        }
        const loading = toast.loading('Registering user...')
        Api().post('/register', data)
            .then(() => {
                toast.success('User registered successfully!')
                form.reset()
                setRefresh(prev => prev + 1)
            })
            .catch(error => toast.error(error.response?.data?.message || 'Registration failed. Please try again.'))
            .finally(() => toast.dismiss(loading))
    }

    if (!users) return <Loader />

    const editingSelf = editing?.id === me?.id

    return (
        <div className='p-4 md:p-8 grid gap-8 max-w-3xl mx-auto w-full'>
            <h1 className='text-3xl font-bold text-center mb-2 tracking-tight'>Users</h1>

            <div className='w-full overflow-x-auto rounded-xl border border-zinc-800 bg-[#0d0d0d]'>
                <table className='w-full border-collapse text-left text-sm text-zinc-300'>
                    <thead className='bg-[#141414] border-b border-[#b3078b]/30 text-xs uppercase tracking-wider text-gray-400'>
                        <tr>
                            <th className='py-3 px-4'>Name</th>
                            <th className='py-3 px-4'>Role</th>
                            <th className='py-3 px-4 text-right'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-zinc-800/40'>
                        {users.map(user => (
                            <tr key={user.id} className='hover:bg-zinc-900/30 transition-colors'>
                                <td className='py-3 px-4 font-medium text-white'>
                                    {user.userName}
                                    {user.id === me?.id && <span className='ml-2 text-xs text-gray-500'>(you)</span>}
                                </td>
                                <td className='py-3 px-4'>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${user.isAdmin ? 'bg-[#b3078b]/10 text-[#e04fbf] border-[#b3078b]/30' : 'bg-zinc-800/40 text-zinc-400 border-zinc-700'}`}>
                                        {user.isAdmin ? 'ADMIN' : 'USER'}
                                    </span>
                                </td>
                                <td className='py-3 px-4'>
                                    <div className='flex justify-end items-center gap-3'>
                                        {isAdmin && user.id !== me?.id && (
                                            <Button id={'admin_' + user.id} role='option' type='button' onClick={() => toggleAdmin(user)} className='rounded text-xs'>
                                                {user.isAdmin ? 'Remove admin' : 'Make admin'}
                                            </Button>
                                        )}
                                        <Button id={'edit_' + user.id} role='generic' type='button' onClick={() => startEditing(user)} className='p-1 hover:text-[#b3078b]' title='Edit'>
                                            <Pencil className='h-4 w-4' />
                                        </Button>
                                        {isAdmin && user.id !== me?.id && (
                                            <Button id={'delete_' + user.id} role='generic' type='button' onClick={() => remove(user)} className='p-1 text-red-500 hover:text-red-400' title='Delete'>
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editing && (
                <div className='p-6 border border-[#960675] rounded-md bg-black'>
                    <h2 className='text-lg text-center font-semibold mb-4 text-gray-100'>
                        {editingSelf ? 'Your user' : 'Editing ' + users.find(u => u.id === editing.id)?.userName}
                    </h2>
                    <form className='grid gap-4' onSubmit={save}>
                        <input type='text' placeholder='Name' className={inputClass} value={editing.userName} onChange={e => setEditing({ ...editing, userName: e.target.value })} required maxLength={50} />
                        <input type='password' placeholder='New password (leave empty to keep it)' className={inputClass} value={editing.password} onChange={e => setEditing({ ...editing, password: e.target.value })} autoComplete='new-password' />
                        {editingSelf && editing.password && (
                            <input type='password' placeholder='Current password' className={inputClass} value={editing.currentPassword} onChange={e => setEditing({ ...editing, currentPassword: e.target.value })} autoComplete='current-password' required />
                        )}
                        {editing.password && (
                            <p className='text-xs text-gray-500'>Changing the password logs {editingSelf ? 'you' : 'them'} out everywhere else.</p>
                        )}
                        <div className='flex gap-2'>
                            <Button id='cancelEdit' role='cancel' type='button' onClick={() => setEditing(null)} className='flex-1 p-2.5 mt-2 rounded-md'>Cancel</Button>
                            <Button id='saveUser' role='action' type='submit' className='flex-1 p-2.5 mt-2 rounded-md font-medium'>Save</Button>
                        </div>
                    </form>
                </div>
            )}

            {isAdmin && (
                <div className='p-6 border border-[#960675] rounded-md bg-black'>
                    <h2 className='text-lg text-center font-semibold mb-4 text-gray-100'>Create New User</h2>
                    <form className='grid gap-4' onSubmit={createUser}>
                        <input id='newUserName' type='text' placeholder='Username' className={inputClass} required maxLength={50} />
                        <input id='newPassword' type='password' placeholder='Password' className={inputClass} required minLength={4} autoComplete='new-password' />
                        <Button type='submit' id='createUser' role='action' className='p-2.5 mt-2 rounded-md font-medium'>Create User</Button>
                    </form>
                </div>
            )}
        </div>
    )
}
