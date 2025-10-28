"use client";
import Button from "@/Components/Button";
import Modal from "@/Components/Modal/Modal";
import app from "next/app";
import { useState, useEffect, useRef } from "react";
import Popup from "reactjs-popup";
import { PopupActions } from "reactjs-popup/dist/types";

const LogViewer = ({ appId,close }: { appId: string,close:()=>void }) => {
	const [logs, setLogs] = useState<string[]>([]);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		const eventSource = new EventSource(
			process.env.NEXT_PUBLIC_API_URL + "/apps/logs/" + appId,
            { withCredentials: true }
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
	}, [appId]);

	return (
		
			<Modal
				title="Logs"
				close={() => close()}
				className="border border-[#b3078b] bg-black md:w-[55rem]"
			>
				<div>
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
	);
};

export default LogViewer;
