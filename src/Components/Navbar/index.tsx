"use client"
import { useState } from "react";
import Link from 'next/link';
import Sidebar from "./Sidebar";
import menu from "@/Components/Static/menu.svg";
import Image  from "next/image";

export default function Navbar() {
	const [sidebar, setSidebar] = useState(false);
	const showSidebar = () => setSidebar(!sidebar);

	return (
			<div className="grid grid-cols-3 border-b border-[#b3078b] text-white w-screen sticky top-0 left-0 z-10 h-[3rem]">
                <div className="my-auto">
                    <button
                    className="py-auto w-[2.5rem]"
                    type="button"
                    onClick={showSidebar}
                    >
                        <Image
                        id="menuLogo"
                        src={menu}
                        alt="menu"
                        className="border p-1 h-[2rem] invert"
                        />
                    </button>
                </div>
                <Sidebar
                    sidebar={sidebar}
                    showSidebar={showSidebar}
                />
                <div className="mx-auto flex">
                    <Link href="/home" className="m-auto">
                        <h1>Front Desk</h1>
                    </Link>
                </div>
		</div>
	);
}