import Api from "@/Components/Api";
import Button from "@/Components/Button";
import Card from "@/Components/Card";
import Modal from "@/Components/Modal/Modal";
import app from "next/app";
import React, { FormEvent, useRef, useState } from "react";
import toast from "react-hot-toast";
import Popup from "reactjs-popup";
import dockerSVG from "@/Components/Static/docker-svgrepo-com.svg";
import Image from "next/image";
import { PopupActions } from "reactjs-popup/dist/types";
import App from "../Interfaces/Apps";

export default function AppCreator({
	onAppUpdate,
}: {
	onAppUpdate: (oldAppID: string, updatedApp: App | null) => void;
}) {
	const [loading, setLoading] = useState<boolean>(false);
	const ref = useRef<PopupActions>(null);

	function cancelBttn(): void {
		ref?.current?.close();
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		setLoading(true);
		const form = event.target as HTMLFormElement & {
			compose: { value: string };
		};

		const data = {
			compose: form.compose.value,
            tunnel: form.tunnel.checked,
		};

		const saving = toast.loading("Creating container...");
		Api()
			.post(`/apps/create`, data)
			.then((response) => {
				toast.success("Compose saved and running!");
				const newApp: App = response?.data?.data;
				onAppUpdate("", newApp);
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
		<Card className="w-[9rem] h-[9rem]">
			<Popup
				ref={ref}
				modal
				nested
				trigger={
					<div className="cursor-pointer h-full" id="add">
						<div className="h-[2rem] w-full text-center">
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
					</div>
				}
			>
				<Modal
					title="New App"
					close={() => ref?.current?.close()}
					className="border border-[#b3078b] bg-black md:w-[55rem] "
				>
					<form onSubmit={handleSubmit}>
						<div className="px-2">
							<textarea
								className="text-sm my-2 p-2 min-h-[20rem] border border-[#b3078b] w-full"
								id="compose"
								placeholder="Paste your compose file here..."
							/>
							<div className="p-2">
								<div className="flex items-center">
									<input
										id="tunnel"
										type="checkbox"
										className="w-4 h-4"
									/>
									<label htmlFor="tunnel" className="pl-2 cursor-pointer">
										Create Clouflare subdomain
									</label>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4 mt-5">
								<Button
									className="cursor-pointer border border-[#b3078b] text-center"
									type="button"
									onClick={cancelBttn}
									id="cancelBttn"
								>
									Cancel
								</Button>
								<button
									id="submitBttn"
									className="cursor-pointer bg-[#b3078b]"
									type="submit"
									disabled={loading}
								>
									Submit
								</button>
							</div>
						</div>
					</form>
				</Modal>
			</Popup>
		</Card>
	);
}
