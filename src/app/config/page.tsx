"use client"
import Button from '@/Components/Button'
import React, { useEffect, useState } from 'react'
import User from '../login/Interfaces/User';
import Api from '@/Components/Api';
import toast from 'react-hot-toast';

export default function Config() {
    const [cloudflare, setCloudflare] = useState<boolean>(false)
    const [transmission, setTransmission] = useState<boolean>(false)
    const [pihole, setPihole] = useState<boolean>(false)

    useEffect(()=>{
        Api().get('/cloudflare/config')
            .then(response => {
                setCloudflare(response?.data?.status || false);
            })
            .catch(error => {
                console.error('There was an error!', error);
                toast.error('Could not retrieve cloudflare configuration. Please try again.')
            })
        
        Api().get('/transmission/config')
            .then(response => {
                setTransmission(response?.data?.status || false);
            })
            .catch(error => {
                console.error('There was an error!', error);
                toast.error('Could not retrieve transmission configuration. Please try again.')
            })
        
        Api().get('/pihole/config')
            .then(response => {
                setPihole(response?.data?.status || false);
            })
            .catch(error => {
                console.error('There was an error!', error);
                toast.error('Could not retrieve pihole configuration. Please try again.')
            })
    },[])

    function createUser(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        document.getElementById('createUser')?.setAttribute('disabled', 'true');

        const form = e.target as HTMLFormElement;
        const data:User = {
            id: 0,
            userName: (form.userName as HTMLInputElement).value,
            password: (form.password as HTMLInputElement).value
        }; 
        const loading = toast.loading('Registering user...');
        Api().post('/register', data)
            .then(() => {
                toast.success('User registered successfully!');
                form.reset();
            })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
                console.error('There was an error!', error);
            })
            .finally(() => {
                toast.dismiss(loading);
                document.getElementById('createUser')?.removeAttribute('disabled');
            });
    }

    function setupCloudFlare(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        document.getElementById('setupCloudflare')?.setAttribute('disabled', 'true');

        const form = e.target as HTMLFormElement;
        const data = {
            accountId: (form.accountId as HTMLInputElement).value,
            tunnelId: (form.tunnelId as HTMLInputElement).value,
            cloudflareAPIToken: (form.cloudflareAPIToken as HTMLInputElement).value,
            localAddress: (form.localAddress as HTMLInputElement).value,
            zoneId: (form.zoneId as HTMLInputElement).value,
        }; 
        const loading = toast.loading('Setting up cloudflare...');
        Api().post('/cloudflare/config', data)
            .then(() => {
                toast.success('Cloudflare setup successfully!');
                form.reset();
                setCloudflare(true);
                })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Cloudflare setup failed. Please try again.');
                console.error('There was an error!', error);
            })
            .finally(() => {
                toast.dismiss(loading);
                document.getElementById('setupCloudflare')?.removeAttribute('disabled');
            });
    }

    function setupTransmission(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        document.getElementById('setupTransmission')?.setAttribute('disabled', 'true');
        const form = e.target as HTMLFormElement;
        const data = {
            protocol: (form.protocol as HTMLInputElement).value,
            url: (form.url as HTMLInputElement).value,
            port: Number((form.port as HTMLInputElement).value),
            username: (form.username as HTMLInputElement).value,
            password: (form.password as HTMLInputElement).value
        }; 
        const loading = toast.loading('Setting up transmission...');
        Api()
            .post('/transmission/config', data)
            .then(() => {
                toast.success('Transmission setup successfully!');
                form.reset();
                setTransmission(true);
                })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Transmission setup failed. Please try again.');
                console.error('There was an error!', error);
            })
            .finally(() => {
                toast.dismiss(loading);
                document.getElementById('setupTransmission')?.removeAttribute('disabled');
            });
    }

    function setupPihole(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        document.getElementById('setupPihole')?.setAttribute('disabled', 'true');
        const form = e.target as HTMLFormElement;
        const data = {
            piholeUrl: (form.piholeUrl as HTMLInputElement).value,
            piholeToken: (form.piholeToken as HTMLInputElement).value,
        }; 
        const loading = toast.loading('Setting up Pi-hole...');
        Api()
            .post('/pihole/config', data)
            .then(() => {
                toast.success('Pi-hole setup successfully!');
                form.reset();
                setPihole(true);
                })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Pi-hole setup failed. Please try again.');
                console.error('There was an error!', error);
            })
            .finally(() => {
                toast.dismiss(loading);
                document.getElementById('setupPihole')?.removeAttribute('disabled');
            });
    }

    return (
        <div className='p-4 md:p-8 grid gap-8 max-w-2xl mx-auto w-full'>
            <h1 className='text-3xl font-bold text-center mb-2 tracking-tight'>Configuration</h1>
            <div className='grid gap-6'>
                <div className='p-6 border border-[#960675] rounded-md bg-black shadow-sm backdrop-blur-sm'>
                    <h2 className='text-lg text-center font-semibold mb-4 text-gray-100'>Create New User</h2>
                    <form className='grid gap-4' onSubmit={createUser}>
                        <input id='userName' type="text" placeholder='Username' className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required/>
                        <input id='password' type="password" placeholder='Password' className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required/>
                        <Button type='submit' id='createUser' role='action' className='p-2.5 mt-2 rounded-md font-medium'>Create User</Button>
                    </form>
                </div>

                <div className='p-6 border border-[#960675] rounded-md bg-black shadow-sm backdrop-blur-sm'>
                    <div className='flex items-center justify-center mb-4'>
                        <h2 className='text-lg font-semibold text-gray-100'>Transmission Integration</h2>
                        {transmission ? <span className='absolute right-8 text-green-400 text-xs font-medium px-2.5 py-1 bg-green-500/10 rounded-md border border-green-500'>Configured</span> : <span className='absolute right-8 text-red-400 text-xs font-medium px-2.5 py-1 bg-red-500/10 rounded-md border border-red-500'>Not Configured</span>}
                    </div>
                    <form className='grid gap-4' onSubmit={setupTransmission}>
                        <input id='protocol' type="text" placeholder='Protocol (http or https)' className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required/>
                        <input id='url' type="text" placeholder='Address' className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required/>
                        <input id='port' type="text" placeholder='Port' className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required/>
                        <input id='username' type="text" placeholder='Username' className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required/>
                        <input id='password' type="password" placeholder='Password' className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required/>
                        <Button type='submit' id='setupTransmission' role='action' className='p-2.5 mt-2 rounded-md font-medium'>Submit</Button>
                    </form>
                </div>

                <div className='p-6 border border-[#960675] rounded-md bg-black shadow-sm backdrop-blur-sm'>
                    <div className='flex items-center justify-center mb-4'>
                        <h2 className='text-lg font-semibold text-gray-100'>Pi-hole Integration</h2>
                        {pihole ? <span className='absolute right-8 text-green-400 text-xs font-medium px-2.5 py-1 bg-green-500/10 rounded-md border border-green-500'>Configured</span> : <span className='absolute right-8 text-red-400 text-xs font-medium px-2.5 py-1 bg-red-500/10 rounded-md border border-red-500'>Not Configured</span>}
                    </div>
                    <form className='grid gap-4' onSubmit={setupPihole}>
                        <input id='piholeUrl' type="text" placeholder='Pi-hole URL' className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required/>
                        <input id='piholeToken' type="text" placeholder='Pi-hole API Token' className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required/>
                        <Button type='submit' id='setupPihole' role='action' className='p-2.5 mt-2 rounded-md font-medium'>Submit</Button>
                    </form>
                </div>

                <div className='p-6 border border-[#960675] rounded-md bg-black shadow-sm backdrop-blur-sm'>
                    <div className='flex items-center justify-center mb-4'>
                        <h2 className='text-lg font-semibold text-gray-100'>Cloudflare Integration</h2>
                        {cloudflare ? <span className='absolute right-8 text-green-400 text-xs font-medium px-2.5 py-1 bg-green-500/10 rounded-md border border-green-500'>Configured</span> : <span className='absolute right-8 text-red-400 text-xs font-medium px-2.5 py-1 bg-red-500/10 rounded-md border border-red-500'>Not Configured</span>}
                    </div>
                    <form className='grid gap-4' onSubmit={setupCloudFlare}>
                        <input id='accountId' type="text" placeholder='Account ID' className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required/>
                        <input id='tunnelId' type="text" placeholder='Tunnel ID' className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required/>
                        <input id='cloudflareAPIToken' type="text" placeholder='Cloudflare API Token' className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required/>
                        <input id='localAddress' type="text" placeholder='Local address (192.168.0.10)' className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required/>
                        <input id='zoneId' type="text" placeholder='Zone Id' className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required/>
                        <Button type='submit' id='setupCloudflare' role='action' className='p-2.5 mt-2 rounded-md font-medium'>Submit</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
