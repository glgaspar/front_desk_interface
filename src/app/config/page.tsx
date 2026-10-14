"use client"
import Button from '@/Components/Button'
import React, { useEffect, useState } from 'react'
import Api from '@/Components/Api';
import toast from 'react-hot-toast';
import { useUser } from '@/Components/User';
import Loader from '@/Components/Loader';
import Notifications from './Components/Notifications';
import NginxProxyManager from './Components/NginxProxyManager';

export default function Config() {
    const { user, isAdmin } = useUser()
    const [cloudflare, setCloudflare] = useState<boolean>(false)
    const [transmission, setTransmission] = useState<boolean>(false)
    const [pihole, setPihole] = useState<boolean>(false)
    const [cloudflareConfig, setCloudflareConfig] = useState<{localAddress: string, accountIdSet: boolean, tunnelIdSet: boolean, zoneIdSet: boolean, tokenSet: boolean}|null>(null)

    useEffect(()=>{
        Api().get('/cloudflare/config')
            .then(response => {
                setCloudflare(response?.data?.status || false);
                setCloudflareConfig(response?.data?.data || null);
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
                setCloudflare(true);
                // clearing the ids from the screen, they are saved, no need to keep showing them
                form.reset();
                setCloudflareConfig({localAddress: data.localAddress, accountIdSet: true, tunnelIdSet: true, zoneIdSet: true, tokenSet: true});
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

    if (!user) return <Loader />

    if (!isAdmin) {
        return (
            <div className='p-8 text-center text-gray-400'>
                Only admins can change settings. You can still change your own name and password on <a href='/users' className='text-[#b3078b] underline'>Users</a>.
            </div>
        )
    }

    return (
        <div className='p-4 md:p-8 grid gap-8 max-w-2xl mx-auto w-full'>
            <h1 className='text-3xl font-bold text-center mb-2 tracking-tight'>Configuration</h1>
            <div className='grid gap-6'>
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
                    <form className='grid gap-4' onSubmit={setupCloudFlare} key={cloudflareConfig ? 'loaded-' + cloudflareConfig.localAddress : 'empty'}>
                        <input id='accountId' type="password" placeholder={cloudflareConfig?.accountIdSet ? 'Account ID (unchanged)' : 'Account ID'} className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required={!cloudflareConfig?.accountIdSet}/>
                        <input id='tunnelId' type="password" placeholder={cloudflareConfig?.tunnelIdSet ? 'Tunnel ID (unchanged)' : 'Tunnel ID'} className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required={!cloudflareConfig?.tunnelIdSet}/>
                        <input id='cloudflareAPIToken' type="password" placeholder={cloudflareConfig?.tokenSet ? 'Cloudflare API Token (unchanged)' : 'Cloudflare API Token'} className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required={!cloudflareConfig?.tokenSet}/>
                        <input id='localAddress' type="text" placeholder='Local address (192.168.0.10)' defaultValue={cloudflareConfig?.localAddress} className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required/>
                        <input id='zoneId' type="password" placeholder={cloudflareConfig?.zoneIdSet ? 'Zone Id (unchanged)' : 'Zone Id'} className='w-full p-2.5 rounded-lg bg-black/50 border border-[#960675] rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-[#b3078b] focus:ring-1 focus:ring-[#b3078b] transition-all' required={!cloudflareConfig?.zoneIdSet}/>
                        <Button type='submit' id='setupCloudflare' role='action' className='p-2.5 mt-2 rounded-md font-medium'>Submit</Button>
                    </form>
                </div>

                <NginxProxyManager />

                <Notifications />
            </div>
        </div>
    )
}
