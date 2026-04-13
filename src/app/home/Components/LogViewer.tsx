"use client";
import { EventConsumer } from "@/Components/Api";
import Modal from "@/Components/Modal/Modal";
import { useState, useEffect, useRef } from "react";

const LogViewer = ({ appId,close }: { appId: string,close:()=>void }) => {
	const [logs, setLogs] = useState<string[]>([]);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		const eventSource = EventConsumer("/apps/logs/" + appId)

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
						<div ref={(el) => {
							if (el) {
								el.scrollIntoView({ behavior: "smooth" });
							}
						}} />
                    </pre>					

				</div>
			</Modal>
	);
};

export default LogViewer;
