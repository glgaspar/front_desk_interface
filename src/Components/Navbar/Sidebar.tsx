"use client"
import { useRef } from "react";
import { useClickOutside } from "@/Utils/useClickOutside";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast";
import Api from "../Api";
import Button from "@/Components/Button";

export default function Sidebar({ sidebar, showSidebar }:{ sidebar:boolean, showSidebar:()=>void }) {
    const ref = useRef<HTMLDivElement>(null)
    const router = useRouter();
    useClickOutside(ref, showSidebar, sidebar, "menuLogo");

    function logout() {
      Api().get("/login/logout")
        .then(() => {
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

        <nav ref={ref} className={`flex flex-col fixed top-12 bottom-0 left-0 z-20 bg-black border-r border-r-[#b3078b] w-64 transition-transform ease-in-out duration-300 transform ${sidebar ? "translate-x-0" : "-translate-x-full"}`}>
          <ul className="flex-1 grid content-start gap-2 p-2 w-full overflow-y-auto text-center">
            <li className="list-none" onClick={showSidebar}>
              <Link href="/home" className="block w-full text-white no-underline rounded p-3 hover:bg-[#b3078b] focus:bg-[#b3078b] transition-colors">
                Home
              </Link>
            </li>
            <li className="list-none" onClick={showSidebar}>
              <Link href="/widgets" className="block w-full text-white no-underline rounded p-3 hover:bg-[#b3078b] focus:bg-[#b3078b] transition-colors">
                Widgets
              </Link>
            </li>
            <li className="list-none" onClick={showSidebar}>
              <Link href="/config" className="block w-full text-white no-underline rounded p-3 hover:bg-[#b3078b] focus:bg-[#b3078b] transition-colors">
                Config
              </Link>
            </li>
          </ul>
          <div className="p-4 border-t border-t-[#b3078b]">
            <Button 
              id="logoutBtn"
              role="action"
              className="w-full py-2 rounded"
              onClick={() => { logout(); showSidebar(); }}
            >
              Logout
            </Button>
          </div>
        </nav>
    );
}