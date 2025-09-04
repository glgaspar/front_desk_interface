"use client";

import { useState, useEffect } from "react";
import Card from '@/Components/Card';
import ProgressBar from "@/Components/ProgressBar";
// import { Badge } from "@/components/ui/badge";
import Button from "@/Components/Button";
import { Cpu, HardDrive, MemoryStick } from "lucide-react";
import Api from "@/Components/Api";
import Loader from "@/Components/Loader";

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
		if (percentage < 30) return "text-chart-1";
		if (percentage < 70) return "text-chart-5";
		return "text-chart-4";
	};

	const getProgressColor = (percentage: number) => {
		if (percentage < 30) return "bg-chart-1";
		if (percentage < 70) return "bg-chart-5";
		return "bg-chart-4";
	};

	if (loading	|| !data) {
		return (
			<Loader />
		);
	}

	return (
		<div className="space-y-4">
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
						<span
							className={`text-lg font-bold ${getUsageColor(
								data.cpuPercent
							)}`}
						>
							{data.cpuPercent.toFixed(1)}%
						</span>
					</div>
					<ProgressBar color={getProgressColor(data.cpuPercent)} percentage={data.cpuPercent} />
				</div>
			</Card>

			<Card>
				<div className="flex items-center gap-2 mb-2">
					<MemoryStick className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm font-medium">Memory</span>
				</div>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span
							className={`text-lg font-bold ${getUsageColor(
								data.memoryPercent
							)}`}
						>
							{data.memoryPercent.toFixed(1)}%
						</span>
					</div>
					<ProgressBar color={getProgressColor(data.memoryPercent)} percentage={data.memoryPercent} />
				</div>
			</Card>

			<Card>
				<div className="text-sm font-medium mb-2">Top Processes</div>
				<div className="space-y-2">
					<div className="grid grid-cols-2">
						<Button type="button" className={`${procs === "procCPU" ? 'border-b' : ''} text-center cursor-pointer py-0.5 mx-3`} onClick={()=>setProcs("procCPU")} id="toggleCPU" > <Cpu className="mx-auto h-4 w-4 text-muted-foreground" /></Button>
						<Button type="button" className={`${procs === "procMem" ? 'border-b' : ''} text-center cursor-pointer py-0.5 mx-3`} onClick={()=>setProcs("procMem")} id="toggleMem"> <MemoryStick className="mx-auto h-4 w-4 text-muted-foreground" /></Button>
					</div>
					{data[procs].slice(0, 3).map((process) => (
						<div
							key={`proc-${process.pid}`}
							className="flex items-center justify-between text-xs"
						>
							<div className="truncate flex-1 mr-2">
								<div className="font-medium">
									{process.name}
								</div>
							</div>
							<div
								className={`font-bold ${getUsageColor(
									process.cpuPercent || 0
								)}`}
							>
								{(process.cpuPercent || 0).toFixed(1)}%
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
