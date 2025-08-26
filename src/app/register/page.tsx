import Link from 'next/link';
import React from 'react'
import Api from '@/Components/Api';
import User from '../login/Interfaces/User';
import toast from "react-hot-toast";


export default function Register() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        document.getElementById('registerBttn')?.setAttribute('disabled', 'true');
        const form = e.target as HTMLFormElement;
        const data:User = {
            id: 0,
            userName: (form.elements.namedItem('userName') as HTMLInputElement).value,
            password: (form.elements.namedItem('password') as HTMLInputElement).value
        }; 
        const loading = toast.loading('Registering user...');
        Api().post('/register', data)
            .then(response => {
                window.location.href = "/login"
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
        <div id="signupForm" className="m-auto grid gap-4 mt-[4rem]">
            <form className="grid gap-4 bg-[#1c1c1c] p-4 rounded-lg w-[30rem] m-auto" onSubmit={handleSubmit}>
                <h4 className="text-center font-[600] text-lg mt-2">Create User</h4>
                <div className="form grid gap-4">
                    <div className="col-span-1 grid">
                        <span className="text-center">Name</span>
                        <input id="userName" name="userName" placeholder="userName" className="text-center w-[2/4] bg-black" required />
                    </div>
                    <div className="col-span-1 grid">
                        <span className="text-center">Password</span>
                        <input id="password" name="password"  placeholder="password" type="password" className="text-center w-[2/4] bg-black" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Link className='cursor-pointer border border-[#b3078b] text-center' href={'/login'}>
                            Login
                        </Link>
                        <button id="registerBttn" className="cursor-pointer bg-[#b3078b]" type="submit">
                            Login
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
