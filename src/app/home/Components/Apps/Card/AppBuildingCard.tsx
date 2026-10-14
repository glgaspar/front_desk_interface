"use client"
import Terminal, { appendLine } from "@/Components/Terminal";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Card from "@/Components/Card";
import dockerSVG from "@/Components/Static/docker-svgrepo-com.svg";
import Popup from "reactjs-popup";
import { EventConsumer, track } from "@/Components/Api";
import { PopupActions } from "reactjs-popup/dist/types";

export default function AppBuildingCard({appName,end}: {appName: string;end: () => void}) {
	const [messages, setMessages] = useState<string[]>([]);
	const ref = useRef<PopupActions>(null);
	// end changes on every render of the parent, if it goes in the deps the stream reconnects and repeats the whole log
	const endRef = useRef(end);
	endRef.current = end;

	useEffect(() => {
		const eventSource = EventConsumer("/apps/waitingBuilds/" + appName)
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

	const logTerminal = (
		<Terminal
			title={"build " + appName}
			lines={messages}
			live
			status="building"
			close={() => ref.current?.close()}
		/>
	);

	return (
		<Card className="bg-black w-full min-h-[11rem] flex flex-col gap-2 overflow-hidden animate-pulse" key={appName}>
			<div className="flex items-center gap-2 min-w-0" title={appName}>
				<Image
					src={dockerSVG}
					alt={appName}
					className="h-8 w-8 shrink-0 rounded-lg"
					width={32}
					height={32}
					unoptimized
				/>
				<p className="truncate font-medium">{appName}</p>
			</div>
			<div className="flex flex-wrap items-center gap-1 text-[10px] font-medium">
				<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
					<span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-ping" />
					BUILDING
				</span>
			</div>
			<p className="flex-1 flex items-end text-[10px] font-mono text-gray-500 break-all line-clamp-3">
				{messages[messages.length - 1] || "waiting for logs..."}
			</p>
			<div className="flex justify-between items-center border-t border-zinc-800 pt-2">
				<Popup
					ref={ref}
					onOpen={() => track("opened build logs", appName)}
					modal
					nested
					trigger={
						<div
							className="bg-none text-[1.5rem] flex justify-center items-center w-[2rem] h-[2rem] cursor-pointer hover:text-[#b3078b] transition-colors"
							id="building"
							title="See the build logs"
						>
							&#9881;
						</div>
					}
				>
					{logTerminal}
				</Popup>
			</div>
		</Card>
	);
}
