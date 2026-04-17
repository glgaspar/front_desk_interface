"use client"
import Api from "@/Components/Api";
import Button from "@/Components/Button";
import Card from "@/Components/Card";
import Modal from "@/Components/Modal/Modal";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Popup from "reactjs-popup";
import dockerSVG from "@/Components/Static/docker-svgrepo-com.svg";
import Image from "next/image";
import { PopupActions } from "reactjs-popup/dist/types";
import CodeMirror from '@uiw/react-codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { EditorView } from '@codemirror/view';
import { okaidia } from '@uiw/codemirror-theme-okaidia';

export default function AppCreator({onAppUpdate}: {onAppUpdate: (newBuildTopic: string) => void;}) {
	const [loading, setLoading] = useState<boolean>(false);
	const ref = useRef<PopupActions>(null);
	const [cloudflare, setCloudflare] = useState<boolean>(false)
	const [compose, setCompose] = useState<string>("")

    useEffect(()=>{
        Api().get('/cloudflare/config')
            .then(response => {
                setCloudflare(response?.data?.data);
            })
            .catch(error => {
                console.error('There was an error!', error);
                toast.error('Could not retrieve cloudflare configuration. Please try again.')
            })
    },[])

	function cancelBttn(): void {
		ref?.current?.close();
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		setLoading(true);
		const form = event.target as HTMLFormElement & {
			tunnel?: { checked: boolean };
		};

		const data = {
			compose: compose,
			tunnel: form.tunnel?.checked,
		};

		const saving = toast.loading("Creating container...");
		Api()
			.post(`/apps/create`, data)
			.then((response) => {
				toast.success("Compose saved and running!");
				const newApp = response?.data?.data;
				onAppUpdate(newApp.topic);
			})
			.catch((error) => {
				toast.error(
					error?.response?.data?.message ||
						"Unknow error. Better luck next time..."
				);
				console.log(error);
			})
			.finally(() => {
				toast.dismiss(saving);
				ref?.current?.close();
				setLoading(false);
			});
	}

	return (
		<Card className="w-36 h-36 bg-black">
			<Popup
				ref={ref}
				modal
				nested
				trigger={<div className="cursor-pointer h-full" id="add">
							<div className="h-8 w-full text-center">
								<p>Add App</p>
							</div>
							<div>
								<Image
									src={dockerSVG}
									alt="Add app"
									className="m-auto h-10 rounded-lg"
									unoptimized
								/>
							</div>
						</div>}
				>
				<Modal
					title="New App"
					close={() => ref?.current?.close()}
					className="border border-[#b3078b] bg-[#0a0a0a] w-[95vw] md:w-[48rem] rounded-lg shadow-2xl overflow-hidden"
				>
					<form onSubmit={handleSubmit}>
						<div className="p-4 flex flex-col gap-6 text-gray-200 max-h-[85dvh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
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
											{loading ? 'Creating...' : 'Create App'}
										</Button>
									</div>
								</div>
								<CodeMirror
									value={compose}
									height="min(400px, 50dvh)"
									extensions={[yaml(), EditorView.lineWrapping]}
									onChange={(value: string) => setCompose(value)}
									theme={okaidia}
									className='w-full text-base border border-[#b3078b]/50 rounded-md overflow-hidden'
									placeholder="Paste your docker-compose.yml content here..."
								/>
							</div>
							{cloudflare && (
								<div className="flex items-center gap-2 bg-black border border-gray-800 p-3 rounded-md">
									<input
										id="tunnel"
										type="checkbox"
										className="w-4 h-4 accent-[#b3078b] bg-gray-800 border-gray-700 rounded focus:ring-[#b3078b] focus:ring-2 cursor-pointer"
									/>
									<label htmlFor="tunnel" className="text-sm text-gray-300 cursor-pointer">
										Create Cloudflare subdomain
									</label>
								</div>
							)}
						</div>
					</form>
				</Modal>
			</Popup>
		</Card>
	);
}
