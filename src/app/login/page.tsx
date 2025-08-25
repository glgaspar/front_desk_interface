"use client"
import Link from 'next/link';
import React from 'react'

export default function Login() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const userName = (form.elements.namedItem('userName') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
        console.log({ userName, password });
    }

    return (
        <div id="loginForm" className="m-auto grid gap-4 mt-[4rem]">
            <form className="grid gap-4 bg-[#1c1c1c] p-4 rounded-lg w-[30rem] m-auto"
                onSubmit={handleSubmit}>
                <h4 className="text-center font-[600] text-lg mt-2">Login</h4>
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
                        <Link className='cursor-pointer border border-[#b3078b] text-center' href={'/register'}>
                            Create Account
                        </Link>
                        <button className="cursor-pointer bg-[#b3078b]" type="submit">
                            Login
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
