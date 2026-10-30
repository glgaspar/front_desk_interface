"use client";
import Api, { EventConsumer } from "@/Components/Api";
import Terminal, { appendLine, systemLine } from "@/Components/Terminal";
import { Loader2, Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";

const LogViewer = ({ appId, appName, close }: { appId: string, appName?: string, close:()=>void }) => {
	const [logs, setLogs] = useState<string[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const [ollama, setOllama] = useState(false);
	const [explaining, setExplaining] = useState(false);
	const [explanation, setExplanation] = useState("");

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

	useEffect(() => {
		Api().get("/services/ollama/config")
			.then(res => setOllama(res?.data?.status === true))
			.catch(() => setOllama(false));
	}, []);

	// the api reads the logs itself, sending 5000 lines from the browser would be silly
	function explain() {
		if (explaining) return;
		setExplaining(true);
		setExplanation("");
		Api().post("/apps/explain/" + appId)
			.then(res => setExplanation(res?.data?.data || "Ollama had nothing to say"))
			.catch(error => setExplanation(error?.response?.data?.message || "Could not ask ollama"))
			.finally(() => setExplaining(false));
	}

	return (
		<Terminal
			title={"docker logs -f " + (appName || appId.slice(0, 12))}
			lines={logs}
			live={isConnected}
			status={isConnected ? "connected" : "disconnected"}
			close={close}
			actions={ollama && (
				<button type="button" onClick={explain} disabled={explaining} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#e04fbf] hover:bg-zinc-800 cursor-pointer disabled:opacity-60" title="Ask ollama what is going on">
					{explaining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
					<span className="hidden sm:inline">{explaining ? "thinking..." : "explain"}</span>
				</button>
			)}
			footer={explanation && (
				<div className="relative shrink-0 max-h-[40%] overflow-auto border-t border-[#b3078b]/40 bg-[#120a10] px-4 py-3 text-sm text-zinc-200 whitespace-pre-wrap">
					<button type="button" onClick={() => setExplanation("")} className="absolute top-2 right-2 p-1 rounded text-zinc-500 hover:text-white cursor-pointer" title="Close">
						<X className="h-4 w-4" />
					</button>
					<p className="flex items-center gap-1 mb-1 text-xs text-[#e04fbf]"><Sparkles className="h-3 w-3" /> ollama</p>
					{explanation}
				</div>
			)}
		/>
	);
};

export default LogViewer;
