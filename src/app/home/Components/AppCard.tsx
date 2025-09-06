import React from 'react'
import App from '../Interfaces/Apps'
import dockerSVG from '@/Components/Static/docker-svgrepo-com.svg';
import Image from 'next/image';
import Card from '@/Components/Card';
import Api from '@/Components/Api';
import AppConfig from './AppConfig';

export default function AppCard({item, replace}:{item:App, replace:(app:App)=>void}) {
    let running: boolean = false
    if (item.state.status == "running") {
        running = true
    } 
    function turnOnOff() {
        let toggle = "start"
        if (running) {
            toggle = "stop"
        }
        Api()
            .put(`/apps/toggleOnOff/${item.id}/${toggle}`)
            .then((response) => {
                replace(response?.data?.data)
            })
            .catch((error) => {
                console.error(
                    error?.response?.data?.message ||
                        "Unknow error fetching apps. Better luck next time..."
                );
            })
    }

    return (
        <Card className='w-[9rem] h-[9rem]' key={item.id}>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
                <div className='h-[2rem] w-full text-center'>
                    <p>{item.name}</p>
                </div>
                <div >
                    <Image src={item.logo||dockerSVG} alt={item.name} className="m-auto h-10 rounded-lg"/>
                </div>
                <p className='mt-2 text-center text-xs'>{item.state.status.toUpperCase()}</p>
            </a>
            <div className='px-5 grid grid-cols-2 gap-3'>
                <div className='w-[2rem] h-[2rem]'>
                    <AppConfig  app={item} />
                </div>
                <div onClick={turnOnOff} className={`w-[2rem] h-[2rem] relative grid place-items-center rounded-[50%] border-solid border-[#ddd] before:content-[""] before:w-6/12 before:h-3/6 before:absolute before:rounded-[50%] before:border-[10px] before:border-solid before:border-[#eee] hover:cursor-pointer ${running ? 'before:border-[green]' : ''}`} />
            </div>
        </Card>
    )
}
