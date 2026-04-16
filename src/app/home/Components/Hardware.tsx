"use client";

import { useState, useEffect } from "react";
import Card from '@/Components/Card';
import ProgressBar from "@/Components/ProgressBar";
// import { Badge } from "@/components/ui/badge";
import Button from "@/Components/Button";
import { Cpu, MemoryStick } from "lucide-react";
import Api from "@/Components/Api";
import Loader from "@/Components/Loader";
import { SystemData } from "../Interfaces/Monitor";

export default function Hardware() {
	const [data, setData] = useState<SystemData | null>(null);
	const [loading, setLoading] = useState(true);
	const [procs, setProcs] = useState<"procMem"|"procCPU">("procCPU")
	const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
	const [isPolling, setIsPolling] = useState(true);

	function loadData(){
		Api()
			.get("/system/usage")
			.then((response) => {
				setData(response.data.data);
				setLastUpdate(new Date());
			})
			.catch((error) => {
				console.error(
					error?.response?.data?.message ||
						"Unknow error fetching apps. Better luck next time..."
				);
			})
	};

	useEffect(() => {
		loadData()
		setLoading(false);
	}, []);

	useEffect(() => {
		if (!isPolling) return;

		const interval = setInterval(() => {
			loadData();
		}, 10000); // 10 seconds

		return () => clearInterval(interval);
	}, [isPolling]);

	const getUsageColor = (percentage: number) => {
		if (percentage < 30) return "#48b53c";
		if (percentage < 70) return "#b5a13c";
		return "#b53c3c";
	};

	if (loading	|| !data) {
		return (
			<Loader />
		);
	}
	return (
		<div className="grid grid-cols-2 md:grid-cols-1">
			{/* <div className="flex items-center justify-between">
				<Badge
					variant={data ? "default" : "destructive"}
					className="text-xs"
				>
					{data ? "Online" : "Offline"}
				</Badge>
				<Button
					onClick={() => setIsPolling(!isPolling)}
					className="h-6 w-6 p-0" id="activity" type="button"				>
					<Activity
						className={`h-3 w-3 ${
							isPolling ? "animate-pulse" : ""
						}`}
					/>
				</Button>
			</div> */}
			<Card>
				<div className="flex items-center gap-2 mb-2">
					<Cpu className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm font-medium">CPU</span>
				</div>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-lg font-bold" style={{ color: getUsageColor(data.cpuPercent) }}>
							{data.cpuPercent.toFixed(3)}%
						</span>
					</div>
					<ProgressBar color={getUsageColor(data.cpuPercent)} percentage={data.cpuPercent} />
				</div>
			</Card>

			<Card>
				<div className="flex items-center gap-2 mb-2">
					<MemoryStick className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm font-medium">Memory</span>
				</div>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-lg font-bold" style={{ color: getUsageColor(data.memoryPercent) }}>
							{data.memoryPercent.toFixed(3)}%
						</span>
					</div>
					<ProgressBar color={getUsageColor(data.memoryPercent)} percentage={data.memoryPercent} />
				</div>
			</Card>

			<Card className="hidden md:block">
				<div className="text-sm font-medium mb-2">Top Processes</div>
				<div className="space-y-2 text-center">
					<div className="grid grid-cols-2">
						<Button type="button" className={`${procs === "procCPU" ? 'border-b' : ''} text-center cursor-pointer py-0.5 mx-3`} onClick={()=>setProcs("procCPU")} id="toggleCPU" > <Cpu className="mx-auto h-4 w-4 text-muted-foreground" /></Button>
						<Button type="button" className={`${procs === "procMem" ? 'border-b' : ''} text-center cursor-pointer py-0.5 mx-3`} onClick={()=>setProcs("procMem")} id="toggleMem"> <MemoryStick className="mx-auto h-4 w-4 text-muted-foreground" /></Button>
					</div>
					<div className="py-2 flex items-center justify-between text-xs px-1.5 border-b border-gray-800/50 mb-1">
						<div className="truncate flex-[2] mr-2 text-left font-medium">
							Process
						</div> 
						<div className="flex-1 mr-2 text-center font-medium whitespace-nowrap shrink-0">
							PID
						</div> 
						<div className="flex-1 text-right font-medium whitespace-nowrap shrink-0">
							Usage
						</div> 
					</div>
					{procs && data[procs].map((process) => (
						<div key={`proc-${process.pid}`} className="py-1 flex items-center justify-between text-xs px-1.5" >
							<div className="truncate flex-[2] mr-2 text-left font-medium" title={process.name}>
								{process.name}
							</div> 
							<div className="flex-1 mr-2 text-center font-medium whitespace-nowrap shrink-0">
								{process.pid}
							</div> 
							<div
								className="flex-1 text-right font-bold whitespace-nowrap shrink-0"
								style={{ color: procs == "procCPU" ? getUsageColor(process.cpuPercent || 0) : getUsageColor(process.memPercent || 0) }}
							>
								{(procs == "procCPU" ? (process.cpuPercent ?? 0) : (process.memPercent ?? 0)).toFixed(3)}%
							</div>
						</div>
					))}
				</div>
			</Card>

			<div className="text-xs text-muted-foreground text-center">
				Updated: {lastUpdate.toLocaleTimeString()}
			</div>
		</div>
	);
}
