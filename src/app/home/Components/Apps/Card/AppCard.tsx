import React, { useState } from 'react'
import toast from 'react-hot-toast';
import App from '../../../Interfaces/Apps'
import dockerSVG from '@/Components/Static/docker-svgrepo-com.svg'
import Image from 'next/image';
import Card from '@/Components/Card';
import Api from '@/Components/Api';
import AppConfig from '../AppConfig';

export default function AppCard({item, onAppUpdate}:{item:App, onAppUpdate:(oldAppID:string, updatedApp: App|null)=>void}) {
    let running: boolean = false
    if (item.state?.status == "running") {
        running = true
    } 
    const [toggling, setToggling] = useState(false)

    function turnOnOff() {
        if (toggling) return
        setToggling(true)
        let toggle = "start"
        if (running) {
            toggle = "stop"
        }
        Api()
            .put(`/apps/toggleOnOff/${item.id}/${toggle}`)
            .then((response) => {
                onAppUpdate(item.id, response?.data?.data)
            })
            .catch((error) => {
                toast.error(
                    error?.response?.data?.message ||
                        "Unknow error toggling app. Better luck next time..."
                );
            })
            .finally(() => setToggling(false))
    }

    return (
        <Card className='w-[9rem] h-[9rem] bg-black' key={item.id}>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
                <div className='h-[2rem] w-full text-center'>
                    <p>{item.name}</p>
                </div>
                <div >
                    <Image src={item.logo||dockerSVG} alt={item.name} className="m-auto h-10 w-10 rounded-lg" width={40} height={40} unoptimized />
                </div>
                <p className='mt-2 text-center text-xs'>{(item.state?.status || "").toUpperCase()}</p>
            </a>
            <div className='px-5 grid grid-cols-2 gap-3'>
                <div className='w-[2rem] h-[2rem]'>
                    <AppConfig  app={item} onAppUpdate={onAppUpdate} />
                </div>
                <div onClick={turnOnOff} className={`w-[2rem] h-[2rem] relative grid place-items-center rounded-[50%] border-solid border-[#ddd] before:content-[""] before:w-6/12 before:h-3/6 before:absolute before:rounded-[50%] before:border-[10px] before:border-solid before:border-[#eee] hover:cursor-pointer ${running ? 'before:border-[green]' : ''} ${toggling ? 'animate-pulse opacity-50' : ''}`} />
            </div>
        </Card>
    )
}
