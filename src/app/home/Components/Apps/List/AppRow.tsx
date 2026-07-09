"use client"
import React from "react";
import Image from "next/image";
import { Power } from "lucide-react";
import App from "../../../Interfaces/Apps";
import Api from "@/Components/Api";
import AppConfig from "../AppConfig";
import dockerSVG from "@/Components/Static/docker-svgrepo-com.svg";

interface AppRowProps {
	item: App;
	onAppUpdate: (oldAppID: string, updatedApp: App | null) => void;
}

export default function AppRow({ item, onAppUpdate }: AppRowProps) {
	const running = item.state.status === "running";

	const turnOnOff = () => {
		const toggle = running ? "stop" : "start";
		Api()
			.put(`/apps/toggleOnOff/${item.id}/${toggle}`)
			.then((response) => {
				onAppUpdate(item.id, response?.data?.data);
			})
			.catch((error) => {
				console.error(
					error?.response?.data?.message ||
						"Unknown error toggling app. Better luck next time..."
				);
			});
	};

	return (
		<tr className="hover:bg-zinc-900/30 transition-colors">
			<td className="py-3 px-4 flex items-center gap-3">
				<Image
					src={item.logo || dockerSVG}
					alt={item.name}
					className="h-6 w-6 rounded-md object-contain"
					width={24}
					height={24}
					unoptimized
				/>
				<span className="font-medium text-white">{item.name}</span>
			</td>
			<td className="py-3 px-4">
				<span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
					running 
						? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
						: 'bg-red-500/10 text-red-400 border border-red-500/20'
				}`}>
					<span className={`h-1.5 w-1.5 rounded-full ${running ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
					{item.state.status.toUpperCase()}
				</span>
			</td>
			<td className="py-3 px-4">
				<a
					href={item.url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-pink-500 hover:text-pink-400 hover:underline transition-colors"
				>
					{item.url}
				</a>
			</td>
			<td className="py-3 px-4 text-right">
				<div className="inline-flex items-center gap-4 justify-end">
					<div className="w-8 h-8 flex items-center justify-center">
						<AppConfig app={item} onAppUpdate={onAppUpdate} />
					</div>
					<button
						onClick={turnOnOff}
						className={`p-1.5 rounded-full border transition-all cursor-pointer ${
							running
								? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
								: 'border-zinc-700 bg-zinc-800/40 text-zinc-400 hover:bg-zinc-800'
						}`}
						title={running ? "Stop App" : "Start App"}
					>
						<Power className="h-4 w-4" />
					</button>
				</div>
			</td>
		</tr>
	);
}
