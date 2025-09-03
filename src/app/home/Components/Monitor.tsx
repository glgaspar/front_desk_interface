"use client";

import { useState, useEffect } from "react";
import Card from '@/Components/Card';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Cpu, HardDrive, RefreshCw } from "lucide-react";
import Api from "@/Components/Api";

export default function SystemMonitor() {
	const [data, setData] = useState<SystemData | null>(null);
	const [loading, setLoading] = useState(true);
	const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
	const [isPolling, setIsPolling] = useState(true);

	const loadData = async () => {
		Api()
			.get("/apps")
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
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		loadData()
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

	if (!data) {
		return (
			
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Badge
					variant={data ? "default" : "destructive"}
					className="text-xs"
				>
					{data ? "Online" : "Offline"}
				</Badge>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setIsPolling(!isPolling)}
					className="h-6 w-6 p-0"
				>
					<Activity
						className={`h-3 w-3 ${
							isPolling ? "animate-pulse" : ""
						}`}
					/>
				</Button>
			</div>

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
					<Progress value={data.cpuPercent} className="h-1.5" />
				</div>
			</Card>

			<Card>
				<div className="flex items-center gap-2 mb-2">
					<HardDrive className="h-4 w-4 text-muted-foreground" />
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
					<Progress
						value={data.memoryPercent}
						className="h-1.5"
					/>
				</div>
			</Card>

			<Card>
				<div className="text-sm font-medium mb-2">Top Processes</div>
				<div className="space-y-2">
                    {/* TODO: CREATE SELECTOR TO TOGGLE BETWEEN CPU AND RAM */}
					{data["procCPU"].slice(0, 3).map((process) => (
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
