"use client"
import React, { FormEvent, useRef, useState } from 'react'
import Modal from '@/Components/Modal/Modal'
import Popup from 'reactjs-popup'
import Button from '@/Components/Button'
import App from '../Interfaces/Apps'
import { PopupActions } from 'reactjs-popup/dist/types'
import Api from '@/Components/Api'
import toast from 'react-hot-toast'
import { maskDateTime } from '@/Utils/maskDatetime'

export default function AppConfig({app,onAppUpdate}:{app:App,onAppUpdate:(oldAppID:string, updatedApp: App|null)=>void}) {
    const [loading, setLoading] = useState<boolean>(false)
    const [compose, setCompose] = useState<string|unknown>(null)
    const ref = useRef<PopupActions>(null);

    function editCompose() {
        setLoading(true)
        Api().get(`/apps/compose/${app.id}`)
        .then(response => {
            setCompose(response?.data?.data)
        })
        .catch((error) => {
                toast.error(
                    error?.response?.data?.message ||
                        "Unknow error. Better luck next time..."
                );
                console.log(error)
            })
        .finally(()=>{
            setLoading(false)
        })
    }

    function deleteApp() {
        const removing = toast.loading("Removing app...") 
        Api().delete(`/apps/remove/${app.id}`)
        .then(response => {
            toast.success("Container and files delete!")
            onAppUpdate(app.id, null)
        })
        .catch((error) => {
                toast.error(
                    error?.response?.data?.message ||
                        "Unknow error. Better luck next time..."
                );
                console.log(error)
            })
        .finally(()=>{
            toast.dismiss(removing)
            ref?.current?.close();
        })
    }

    function cancelBttn(): void {
        setCompose(null);
        ref?.current?.close();
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault()
        const data = {
            compose: compose
        }

        const saving = toast.loading("Saving file...") 
        Api().post(`/apps/compose/${app.id}`, data)
        .then(response => {
            toast.success("Compose saved and running!")
            const newApp = response?.data?.data 
            onAppUpdate(app.id, newApp)
        })
        .catch((error) => {
                toast.error(
                    error?.response?.data?.message ||
                        "Unknow error. Better luck next time..."
                );
                console.log(error)
            })
        .finally(()=>{
            toast.dismiss(saving)
            ref?.current?.close();
        })
    }

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
            <Modal title={app?.name} close={()=>ref?.current?.close()} className='border border-[#b3078b] bg-black w-[25rem]'>
                <form onSubmit={handleSubmit}>
                    <div className='px-2'>
                        <div className='grid grid-cols[3fr_1fr]'>
                            <div className='grid'>
                                <p> URL: <span>{app?.url}</span></p>
                                <p> Dir: <span>{app?.dir}</span></p>
                            </div>
                            <div className='my-auto'>
                                <div onClick={deleteApp}>
                                    <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-6 w-6" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor" 
                                    strokeWidth={2}
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <hr className='mx-10 my-2 border-[#b3078b]'/>
                        <div className='grid'>
                            <p>Status: <span>{app?.state?.status}</span></p>
                            <p>Exit Code: <span>{app?.state?.exitCode}</span></p>
                            <p>Error: <span>{app?.state?.error}</span></p>
                            <p>Started At: <span>{maskDateTime(app?.state?.startedAt)}</span></p>
                            <p>Finished At: <span>{maskDateTime(app?.state?.finishedAt)}</span></p>
                        </div>
                        <div className='grid'>
                            {
                                typeof compose != 'string'
                                    ? <Button id='composeEdit' onClick={editCompose} type="button" disabled={loading}>Edit Compose</Button>
                                    : <>
                                        <textarea className='text-sm my-2 min-h-[20rem] border border-[#b3078b]' value={compose} onChange={(e)=>setCompose(e.target.value)} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Button className='cursor-pointer border border-[#b3078b] text-center' type='button' onClick={cancelBttn} id='cancelBttn' >
                                                Cancel
                                            </Button>
                                            <button id="submitBttn" className="cursor-pointer bg-[#b3078b]" type="submit">
                                                Submit
                                            </button>
                                        </div>      
                                    </> 
                            }
                        </div>
                    </div>
                </form>
            </Modal>

        </Popup>
    )
}
