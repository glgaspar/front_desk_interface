"use client"
import Link from 'next/link';
import React from 'react'
import Api from '@/Components/Api';
import User from './Interfaces/User';
import toast from "react-hot-toast";

export default function Login() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        document.getElementById('loginBttn')?.setAttribute('disabled', 'true');
        const form = e.target as HTMLFormElement;
        const data:User = {
            id: 0,
            userName: (form.elements.namedItem('userName') as HTMLInputElement).value,
            password: (form.elements.namedItem('password') as HTMLInputElement).value
        }; 
        const loading = toast.loading('Logging in...');
        Api().post('/login', data)
            .then(response => {
                window.location.href = "/home"
            })
            .catch(error => {
                toast.error('Login failed. Please check your credentials and try again.');
                console.error('There was an error!', error);
            })
            .finally(() => {
                toast.dismiss(loading);
                document.getElementById('loginBttn')?.removeAttribute('disabled');
            });
        
    }

    return (
        <div id="loginForm" className="m-auto grid gap-4 mt-[4rem]">
            <form className="grid gap-4 bg-[#1c1c1c] p-4 rounded-lg max-w-[30rem] md:w-[30rem] m-auto" onSubmit={handleSubmit}>
                <h4 className="text-center font-[600] text-lg mt-2">Login</h4>
                <div className="form grid gap-4">
                    <div className="col-span-1 grid">
                        <span className="text-center">Name</span>
                        <input id="userName" name="userName" placeholder="user name" className="text-center w-[2/4] bg-black" required />
                    </div>
                    <div className="col-span-1 grid">
                        <span className="text-center">Password</span>
                        <input id="password" name="password"  placeholder="password" type="password" className="text-center w-[2/4] bg-black" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Link className='cursor-pointer border border-[#b3078b] text-center' href={'/register'}>
                            Create Account
                        </Link>
                        <button id="loginBttn" className="cursor-pointer bg-[#b3078b]" type="submit">
                            Login
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
