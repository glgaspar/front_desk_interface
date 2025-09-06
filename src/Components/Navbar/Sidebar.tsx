"use client"
import { useRef } from "react";
import { useClickOutside } from "@/Utils/useClickOutside";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast";
import Api from "../Api";

export default function Sidebar({ sidebar, showSidebar }:{ sidebar:boolean, showSidebar:()=>void }) {
    const ref = useRef<HTMLDivElement>(null)
    const router = useRouter();
    useClickOutside(ref, showSidebar, sidebar, "menuLogo");

    function logout() {
      Api().get("/login/logout")
        .then(response => {
            toast.success("You have been loged out!")
            router.push('/login'); 
        })
        .catch((error) => {
            toast.error(
                error?.response?.data?.message ||
                    "Unknow error. Better luck next time..."
            );
            console.log(error)
        });
    }

    return (
        <nav ref={ref} className={`flex flex-col fixed top-[3rem] bg-black border-r border-r-[#b3078b] w-full md:w-[15rem] h-[calc(100vh-4rem)] transition-all ease-in-out duration-500
            ${sidebar ? "left-0" : "left-[-30rem]"}
        `}>
          <ul className="grid gap-2 p-2 w-full overflow-y-auto text-center">
            <li className="flex justify-start items-center min-h-12 list-none px-2 cursor-pointer">
              <Link href="/home" className="grow no-underline text-white h-full items-center rounded px-2 py-3 hover:bg-[#b3078b] focus:bg-[#b3078b]">
                Home
              </Link>
            </li>
            <li className="flex justify-start items-center min-h-12 list-none px-2 cursor-pointer">
              <Link href="/widgets" className="grow no-underline text-white h-full items-center rounded px-2 py-3 hover:bg-[#b3078b] focus:bg-[#b3078b]">
                Widgets
              </Link>
            </li>
            <li className="flex justify-start items-center min-h-12 list-none px-2 cursor-pointer">
              <Link href="/config" className="grow no-underline text-white h-full items-center rounded px-2 py-3 hover:bg-[#b3078b] focus:bg-[#b3078b]">
                Config
              </Link>
            </li>
            <li className="flex justify-start items-center min-h-12 list-none px-2 cursor-pointer">
              <div className="grow no-underline text-white h-full items-center rounded px-2 py-3 hover:bg-[#b3078b] focus:bg-[#b3078b]" onClick={logout}>
                Logout
              </div>
            </li>
          </ul>
        </nav>
    );
}