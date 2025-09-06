"use client"
import React, { FormEvent, useRef, useState } from 'react'
import Modal from '@/Components/Modal/Modal'
import Popup from 'reactjs-popup'
import Button from '@/Components/Button'
import App from '../Interfaces/Apps'
import { PopupActions } from 'reactjs-popup/dist/types'
import Api from '@/Components/Api'
import toast from 'react-hot-toast'

export default function AppConfig({app}:{app:App}) {
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
                        <div className='grid'>
                            <p> URL: <span>{app?.url}</span></p>
                            <p> Dir: <span>{app?.dir}</span></p>
                        </div>
                        <hr className='mx-10 my-2 border-[#b3078b]'/>
                        <div className='grid'>
                            <p>Status: <span>{app?.state?.status}</span></p>
                            <p>Exit Code: <span>{app?.state?.exitCode}</span></p>
                            <p>Error: <span>{app?.state?.error}</span></p>
                            <p>Started At: <span>{app?.state?.startedAt}</span></p>
                            <p>Finished At: <span>{app?.state?.finishedAt}</span></p>
                        </div>
                        <div className='grid'>
                            {
                                typeof compose != 'string'
                                    ? <Button id='composeEdit' onClick={editCompose} type="button" disabled={loading}>Edit Compose</Button>
                                    : <>
                                        <textarea className='text-sm my-2 min-h-[20rem] border border-[#b3078b]' value={compose} onChange={(e)=>setCompose(e)} />
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
