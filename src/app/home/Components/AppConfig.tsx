"use client"
import React, { useRef } from 'react'
import Modal from '@/Components/Modal/Modal'
import Popup from 'reactjs-popup'
import Button from '@/Components/Button'
import App from '../Interfaces/Apps'
import { PopupActions } from 'reactjs-popup/dist/types'

export default function AppConfig({app}:{app:App}) {
    const ref = useRef<PopupActions>(null);

    return (
        <Popup  
        ref={ref}
        modal
        nested
        trigger={
            <div className='bg-none text-[1.5rem] text-center w-[2rem] h-[2rem] cursor-pointer ' id="config">
                &#9881;
            </div>
        }>
            <Modal title={app?.Name} close={()=>ref?.current?.close()}>
                <div className='px-2'>
                    <div className='grid grid-cols-3'>
                        <p> Created: <span>{app?.Created}</span></p>
                        <p> Image: <span>{app?.Image}</span></p>
                        <p> Name: <span>{app?.Name}</span></p>
                        <p> RestartCount: <span>{app?.RestartCount}</span></p>
                    </div>
                    <div className='grid grid-cols-3'>
                        <p>Status: <span>{app?.State?.Status}</span></p>
                        <p>Exit Code: <span>{app?.State?.ExitCode}</span></p>
                        <p>Error: <span>{app?.State?.Error}</span></p>
                        <p>Started At: <span>{app?.State?.StartedAt}</span></p>
                        <p>Finished At: <span>{app?.State?.FinishedAt}</span></p>
                    </div>
                        <p>Project: <span>{app?.Config?.Labels["com.docker.compose.project"]}</span></p>
                        <p>Config Files: <span>{app?.Config?.Labels["com.docker.compose.project.config_files"]}</span></p>
                        <p>Working Dir: <span>{app?.Config?.Labels["com.docker.compose.project.working_dir"]}</span></p>
                        <p>Replace: <span>{app?.Config?.Labels["com.docker.compose.replace"]}</span></p>
                </div>
            </Modal>

        </Popup>
    )
}
