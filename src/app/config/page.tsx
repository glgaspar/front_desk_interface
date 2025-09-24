"use client"
import Button from '@/Components/Button'
import React, { useEffect, useState } from 'react'
import User from '../login/Interfaces/User';
import Api from '@/Components/Api';
import toast from 'react-hot-toast';

export default function Config() {
    const [cloudflare, setCloudflare] = useState<boolean>(false)

    useEffect(()=>{
        Api().get('/config/cloudflare')
            .then(response => {
                setCloudflare(response?.data?.data);
            })
            .catch(error => {
                console.error('There was an error!', error);
                toast.error('Could not retrieve cloudflare configuration. Please try again.')
            })
    },[])

    function createUser(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        document.getElementById('createUser')?.setAttribute('disabled', 'true');

        const form = e.target as HTMLFormElement;
        const data:User = {
            id: 0,
            userName: (form.targe.userName as HTMLInputElement).value,
            password: (form.targe.password as HTMLInputElement).value
        }; 
        const loading = toast.loading('Registering user...');
        Api().post('/register', data)
            .then(response => {
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
            accountId: (form.targe.accountId as HTMLInputElement).value,
            tunnelId: (form.targe.tunnelId as HTMLInputElement).value,
            cloudflareAPIToken: (form.targe.cloudflareAPIToken as HTMLInputElement).value,
            hostname: (form.targe.hostname as HTMLInputElement).value
        }; 
        const loading = toast.loading('Setting up cloudflare...');
        Api().post('/config/cloudflare', data)
            .then(response => {
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


    return (
        <div className='p-5 grid gap-5 md:w-[55vw] mx-auto'>
            <h1 className='text-center'>Config</h1>
            <div className='grid gap-10'>
                <div>
                    <h4 className='text-center mb-5'>Create New User</h4>
                    <form className='grid gap-2' onSubmit={createUser}>
                        <input id='userName' type="text" placeholder='Username' className='p-2 rounded bg-black border border-white text-white'/>
                        <input id='password' type="password" placeholder='Password' className='p-2 rounded bg-black border border-white text-white'/>
                        <Button type='submit' id='createUser' className='p-2 rounded cursor-pointer bg-[#b3078b]'>Create User</Button>
                    </form>
                </div>
                <hr className='mx-10 my-2 border-[#b3078b]'/>
                <div>
                    <h4 className='text-center mb-5'>Widgets</h4>
                    <p>to be implemented</p>
                </div>
                <hr className='mx-10 my-2 border-[#b3078b]'/>
                <div>
                    <h4 className='text-center mb-5'>Cloudflare Integration {cloudflare ? <span className='text-green-500 text-sm'>(Configured)</span> : <span className='text-red-500 text-sm'>(Not Configured)</span>}</h4>
                    <form className='grid gap-2' onSubmit={setupCloudFlare}>
                        <input id='accountId' type="text" placeholder='Account ID' className='p-2 rounded bg-black border border-white text-white'/>
                        <input id='tunnelId' type="text" placeholder='Tunnel ID' className='p-2 rounded bg-black border border-white text-white'/>
                        <input id='cloudflareAPIToken' type="text" placeholder='Cloudflare API Token' className='p-2 rounded bg-black border border-white text-white'/>
                        <input id='hostname' type="text" placeholder='Hostname' className='p-2 rounded bg-black border border-white text-white'/>
                        <Button type='submit' id='setupCloudflare' className='p-2 rounded cursor-pointer bg-[#b3078b]'>Submit</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
