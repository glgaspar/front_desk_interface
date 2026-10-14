"use client"
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Popup from "reactjs-popup";
import { PopupActions } from "reactjs-popup/dist/types";
import { Settings } from "lucide-react";
import Terminal, { appendLine } from "@/Components/Terminal";
import { EventConsumer, track } from "@/Components/Api";
import dockerSVG from "@/Components/Static/docker-svgrepo-com.svg";

interface AppBuildingRowProps {
	appName: string;
	end: () => void;
}

export default function AppBuildingRow({ appName, end }: AppBuildingRowProps) {
	const [messages, setMessages] = useState<string[]>([]);
	const ref = useRef<PopupActions>(null);
	// end changes on every render of the parent, if it goes in the deps the stream reconnects and repeats the whole log
	const endRef = useRef(end);
	endRef.current = end;

	useEffect(() => {
		const eventSource = EventConsumer("/apps/waitingBuilds/" + appName);
		eventSource.onmessage = (event) => {
			const msg = event.data;
			if (msg) {
				setMessages((prev) => appendLine(prev, msg));
				if (msg.includes("no active build") || msg.includes("stream closed")) {
					endRef.current();
				}
			}
		};

		eventSource.onerror = (err) => {
			console.error("EventSource failed:", err);
			eventSource.close();
			endRef.current();
		};

		return () => {
			eventSource.close();
		};
	}, [appName]);

	return (
		<tr className="hover:bg-zinc-900/30 transition-colors animate-pulse" key={appName}>
			<td className="py-3 px-4 flex items-center gap-3">
				<Image
					src={dockerSVG}
					alt={appName}
					className="h-6 w-6 rounded"
					width={24}
					height={24}
					unoptimized
				/>
				<span className="font-medium text-white">{appName}</span>
			</td>
			<td className="py-3 px-4">
				<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
					<span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-ping" />
					BUILDING...
				</span>
			</td>
			<td className="py-3 px-4 text-zinc-500">-</td>
			<td className="py-3 px-4 text-zinc-500">-</td>
			<td className="py-3 px-4 text-zinc-500">-</td>
			<td className="py-3 px-4 text-zinc-500">
				Deploying container...
			</td>
			<td className="py-3 px-4 text-right">
				<div className="inline-flex items-center gap-3">
					<Popup
						ref={ref}
						onOpen={() => track("opened build logs", appName)}
						modal
						nested
						trigger={
							<button
								className="p-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 cursor-pointer"
								title="Show Logs"
							>
								<Settings className="h-4 w-4 animate-spin" />
							</button>
						}
					>
						<Terminal
							title={"build " + appName}
							lines={messages}
							live
							status="building"
							close={() => ref.current?.close()}
						/>
					</Popup>
				</div>
			</td>
		</tr>
	);
}
