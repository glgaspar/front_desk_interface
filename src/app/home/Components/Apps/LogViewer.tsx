"use client";
import { EventConsumer } from "@/Components/Api";
import Terminal, { appendLine, systemLine } from "@/Components/Terminal";
import { useState, useEffect } from "react";

const LogViewer = ({ appId, appName, close }: { appId: string, appName?: string, close:()=>void }) => {
	const [logs, setLogs] = useState<string[]>([]);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		const eventSource = EventConsumer("/apps/logs/" + appId)

		eventSource.onopen = () => {
			setIsConnected(true);
			console.log("SSE connection established.");
			setLogs((prev) => appendLine(prev, systemLine("Connection to log stream established...")));
		};

		eventSource.onmessage = (event) => {
			setLogs((prevLogs) => appendLine(prevLogs, event.data));
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
		<Terminal
			title={"docker logs -f " + (appName || appId.slice(0, 12))}
			lines={logs}
			live={isConnected}
			status={isConnected ? "connected" : "disconnected"}
			close={close}
		/>
	);
};

export default LogViewer;
