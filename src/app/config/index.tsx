import Button from '@/Components/Button'
import React from 'react'
import User from '../login/Interfaces/User';
import Api from '@/Components/Api';
import toast from 'react-hot-toast';

export default function Config() {

    function createUser(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

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
                document.getElementById('registerBttn')?.removeAttribute('disabled');
            });
    }

    


    return (
        <div className='p-5 grid gap-5'>
            <h1 className='text-center'>Config</h1>
            <div className='grid gap-5'>
                <div>
                    <h4>Create New User</h4>
                    <form className='grid gap-2' onSubmit={e => createUser(e)}>
                        <input id='userName' type="text" placeholder='Username' className='p-2 rounded bg-black border border-white text-white'/>
                        <input id='password' type="password" placeholder='Password' className='p-2 rounded bg-black border border-white text-white'/>
                        <Button type='submit' id='createUser' className='p-2 rounded cursor-pointer bg-[#b3078b]'>Create User</Button>
                    </form>
                </div>
                <div>
                    <h4>Widgets</h4>
                    <p>to be implemented</p>
                </div>
            </div>
        </div>
    )
}
