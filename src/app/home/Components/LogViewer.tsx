"use client";
import Modal from "@/Components/Modal/Modal";
import app from "next/app";
import { useState, useEffect, useRef } from "react";
import Popup from "reactjs-popup";
import { PopupActions } from "reactjs-popup/dist/types";

const LogViewer = ({ appId }: { appId: string }) => {
	const [logs, setLogs] = useState<string[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const ref = useRef<PopupActions>(null);

	useEffect(() => {
		const eventSource = new EventSource(
			process.env.NEXT_PUBLIC_API_URL + "/logs/" + appId
		);

		eventSource.onopen = () => {
			setIsConnected(true);
			console.log("SSE connection established.");
			setLogs((prev) => [
				...prev,
				"Connection to log stream established...",
			]);
		};

		eventSource.onmessage = (event) => {
			setLogs((prevLogs) => [...prevLogs, event.data]);
		};

		eventSource.onerror = (err) => {
			console.error("EventSource failed:", err);
			setIsConnected(false);
			eventSource.close();
		};

		return () => {
			eventSource.close();
			console.log("connection closed");
		};
	}, []);

	return (
		<Popup
			ref={ref}
			modal
			nested
			trigger={
				<div
					className="bg-none text-[1.5rem] text-center w-[2rem] h-[2rem] cursor-pointer "
					id="config"
				>
					&#9881;
				</div>
			}
		>
			<Modal
				title={app?.name}
				close={() => ref?.current?.close()}
				className="border border-[#b3078b] bg-black md:w-[55rem]"
			>
				<div>
					<h2>Logs</h2>
					<div>
						Connection Status:
                        <span
                            className={`font-bold ml-1 ${isConnected ? "text-green-500" : "text-red-500"}`}
                        >
							{isConnected ? "Connected" : "Disconnected"}
						</span>
					</div>
                    <pre className="bg-black border border-[#b3078b] text-white p-4 h-[60vh] overflow-y-scroll whitespace-pre-wrap break-words">
                        {logs.map((log, index) => (
                            <div key={index}>{log}</div>
                        ))}
                    </pre>
				</div>
			</Modal>
		</Popup>
	);
};

export default LogViewer;
