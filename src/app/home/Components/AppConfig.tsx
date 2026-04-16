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
import LogViewer from './LogViewer'
import CodeMirror from '@uiw/react-codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { EditorView } from '@codemirror/view';
import { okaidia } from '@uiw/codemirror-theme-okaidia';

export default function AppConfig({app,onAppUpdate}:{app:App,onAppUpdate:(oldAppID:string, updatedApp: App|null)=>void}) {
    const [loading, setLoading] = useState<boolean>(false)
    const [compose, setCompose] = useState<string|unknown>(null)
    const ref = useRef<PopupActions>(null);
    const refLog = useRef<PopupActions>(null);

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
        .then(() => {
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
            <div className='bg-none text-[1.5rem] flex justify-center items-center w-[2rem] h-[2rem] cursor-pointer hover:text-[#b3078b] transition-colors' id="config">
                &#9881;
            </div>
        }>
            <Modal title={app?.name} close={()=>ref?.current?.close()} className='border border-[#b3078b] bg-[#0a0a0a] w-[95vw] md:w-[48rem] rounded-lg shadow-2xl overflow-hidden'>
                <form onSubmit={handleSubmit}>
                    <div className='p-4 flex flex-col gap-6 text-gray-200 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent'>
                        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                            <div className='flex flex-col gap-3 min-w-0 w-full'>
                                <p className='flex flex-col items-start gap-0'>
                                    <span className='font-semibold text-gray-400'>URL:</span> 
                                    <a href={app?.url} target="_blank" rel="noopener noreferrer" className='text-blue-400 hover:underline hover:text-blue-300 transition-colors break-all'>
                                        {app?.url}
                                    </a>
                                </p>
                                <p className='flex flex-col items-start gap-0'>
                                    <span className='font-semibold text-gray-400'>Directory:</span> 
                                    <span className='font-mono bg-black border border-gray-800 px-2 py-0.5 rounded text-xs break-all'>{app?.dir}</span>
                                </p>
                            </div>
                            <Button 
                                id="delete" 
                                role='generic'
                                type="button" 
                                onClick={deleteApp}
                                className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded hover:bg-red-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                title="Delete App"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Delete App</span>
                            </Button>
                        </div>
                        
                        <hr className='border-gray-800'/>
                        
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-4 text-sm'>
                            <div className='flex flex-col gap-1'>
                                <span className='text-gray-500 text-xs font-bold uppercase tracking-wider'>Status</span>
                                <span className='flex items-center gap-2 font-medium capitalize'>
                                    <span className={`w-2.5 h-2.5 rounded-full ${app?.state?.status === 'running' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></span>
                                    {app?.state?.status || 'unknown'}
                                </span>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <span className='text-gray-500 text-xs font-bold uppercase tracking-wider'>Exit Code</span>
                                <span className='font-mono'>{app?.state?.exitCode ?? '-'}</span>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <span className='text-gray-500 text-xs font-bold uppercase tracking-wider'>Error</span>
                                <span className='font-mono text-red-400 truncate' title={app?.state?.error}>{app?.state?.error || '-'}</span>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <span className='text-gray-500 text-xs font-bold uppercase tracking-wider'>Started At</span>
                                <span className='text-gray-300'>{maskDateTime(app?.state?.startedAt)}</span>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <span className='text-gray-500 text-xs font-bold uppercase tracking-wider'>Finished At</span>
                                <span className='text-gray-300'>{maskDateTime(app?.state?.finishedAt)}</span>
                            </div>
                        </div>

                        <hr className='border-gray-800'/>

                        <div className='flex flex-col gap-4'>
                            {typeof compose !== 'string' ? (
                                <div className="flex flex-col sm:flex-row justify-around items-center gap-4">
                                    <Popup ref={refLog} modal nested trigger={
                                        <Button id='logs' role='option' onClick={() => refLog?.current?.open()} type="button" className="w-full sm:w-auto">
                                            View Logs
                                        </Button>
                                    }>
                                        <LogViewer appId={app.id} close={() => refLog?.current?.close()} />
                                    </Popup>

                                    <Button id='composeEdit' role='option' onClick={editCompose} type="button" disabled={loading} className="w-full sm:w-auto">
                                        Edit Compose
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#b3078b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                            </svg>
                                            docker-compose.yml
                                        </h3>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <Button role='cancel' type='button' onClick={cancelBttn} id='cancelBttn' className="flex-1 sm:flex-none justify-center">
                                                Cancel
                                            </Button>
                                            <Button id="submitBttn" role='action' type="submit" disabled={loading} className="flex-1 sm:flex-none justify-center">
                                                {loading ? 'Saving...' : 'Save Compose'}
                                            </Button>
                                        </div>
                                    </div>
                                    <CodeMirror
                                        value={compose as string}
                                        height="400px"
                                        extensions={[yaml(), EditorView.lineWrapping]}
                                        onChange={(value: string) => setCompose(value)}
                                        theme={okaidia}
                                        className='border border-[#b3078b]/50 rounded-md overflow-hidden'
                                        placeholder="Paste your docker-compose.yml content here..."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </Modal>

        </Popup>
    )
}
