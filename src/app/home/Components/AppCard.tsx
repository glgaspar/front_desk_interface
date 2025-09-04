import React from 'react'
import App from '../Interfaces/Apps'
import dockerSVG from '@/Components/Static/docker-svgrepo-com.svg';
import Image from 'next/image';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import Api from '@/Components/Api';

export default function AppCard({item, replace}:{item:App, replace:(app:App)=>void}) {
    let running: boolean = false
    if (item.State.Status == "running") {
        running = true
    } 
    function turnOnOff() {
        Api()
            .get(`/apps/toggleOnOff/${item.Id}/${String(running)}`)
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
        <Card className='w-[9rem] h-[9rem]' key={item.Id}>
            <a href="" target="_blank" rel="noopener noreferrer">
                <div className='h-[2rem] w-full text-center'>
                    <p>{item.Config.Labels['com.docker.compose.project']}</p>
                </div>
                <div >
                    <Image src={dockerSVG} alt={item.Name} className="m-auto h-10 rounded-lg"/>
                </div>
                <p className='mt-2 text-center text-xs'>{item.State.Status.toUpperCase()}</p>
            </a>
            <div className='px-5 grid grid-cols-2 gap-3'>
                <div className='w-[2rem] h-[2rem]'>
                    <Button className='bg-none text-[1.5rem] text-center w-[2rem] h-[2rem]' id="config" type="button" onClick={turnOnOff}>
                        &#9881;
                    </Button>
                </div>
                <div className={`w-[2rem] h-[2rem] relative grid place-items-center rounded-[50%] border-solid border-[#ddd] before:content-[""] before:w-6/12 before:h-3/6 before:absolute before:rounded-[50%] before:border-[10px] before:border-solid before:border-[#eee] hover:cursor-pointer ${running ? 'before:border-[green]' : ''}`} />
            </div>
        </Card>
    )
}
