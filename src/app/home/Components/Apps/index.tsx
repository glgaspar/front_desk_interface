"use client"
import React, { useEffect, useRef, useState } from "react";
import App, { AppStats, UpdateStatus } from "../../Interfaces/Apps";
import { AppsContext } from "./AppsContext";
import { Uptime } from "@/app/monitoring/Interfaces";
import AppCard from "./Card/AppCard";
import Api from "@/Components/Api";
import toast from "react-hot-toast";
import AppCreator from "./AppCreator";
import AppBuildingCard from "./Card/AppBuildingCard";
import { LayoutGrid, List, Search } from "lucide-react";
import AppListTable from "./List/AppListTable";
import { useUser } from "@/Components/User";

export default function Apps() {
	const [apps, setApps] = useState<Array<App>>([])
	const [waitingBuilds, setWaitingBuilds] = useState<Array<string>>([])
	const [update, setUpdate] = useState(0)
	const [viewMode, setViewMode] = useState<"card" | "list">("card")
	const [searchQuery, setSearchQuery] = useState("")
	const [stats, setStats] = useState<AppStats[]>([])
	const [updates, setUpdates] = useState<Record<string, UpdateStatus>>({})
	const [uptime, setUptime] = useState<Uptime[]>([])
	const failing = useRef(false)
	const { isAdmin } = useUser()

	function loadApps() {
		Api()
			.get("/apps")
			.then((response) => {
				setApps(Array.isArray(response.data?.data) ? response.data.data : []);
				failing.current = false;
			})
			.catch((error) => {
				// only yell once, not every 10 seconds
				if (failing.current) return;
				failing.current = true;
				toast.error(
					error?.response?.data?.message ||
						"Unknow error fetching apps. Better luck next time..."
				);
			});
	}

	function loadBuilds() {
		Api()
			.get("/apps/waitingBuilds")
			.then((response) => {
				const builds: string[] = Array.isArray(response.data?.data) ? response.data.data : [];
				// the ones that finished leave on their own when the stream closes
				setWaitingBuilds(prev => [...prev, ...builds.filter(b => !prev.includes(b))]);
			})
			.catch((error) => console.error(error));
	}

	useEffect(() => {
		loadApps();
	}, [update]);

	useEffect(() => {
		loadBuilds();
		const interval = setInterval(() => {
			if (document.hidden) return;
			loadApps();
			loadBuilds();
		}, 10000); // same as the system usage
		return () => clearInterval(interval);
	}, [])

	useEffect(() => {
		function loadStats() {
			if (document.hidden) return;
			Api()
				.get("/apps/stats")
				.then((response) => {
					setStats(Array.isArray(response.data?.data) ? response.data.data : []);
				})
				.catch((error) => console.error(error));
		}
		loadStats();
		const interval = setInterval(loadStats, 15000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		refreshUpdates();
	}, []);

	useEffect(() => {
		function loadUptime() {
			if (document.hidden) return;
			Api()
				.get("/monitoring/uptime?range=24h")
				.then((response) => {
					setUptime(Array.isArray(response.data?.data) ? response.data.data : []);
				})
				.catch((error) => console.error(error));
		}
		loadUptime();
		const interval = setInterval(loadUptime, 60000);
		return () => clearInterval(interval);
	}, []);

	function refreshUpdates(force = false) {
		Api()
			.get(`/apps/updates${force ? "?force=true" : ""}`)
			.then((response) => {
				setUpdates(response.data?.data || {});
			})
			.catch((error) => console.error(error));
	}

	useEffect(() => {
		const savedMode = localStorage.getItem("front_desk_view_mode");
		if (savedMode === "card" || savedMode === "list") {
			setViewMode(savedMode);
		}
	}, []);

	const handleViewModeChange = (mode: "card" | "list") => {
		setViewMode(mode);
		localStorage.setItem("front_desk_view_mode", mode);
	};

	function handleAppUpdate(oldAppID:string, updatedApp: App|null) {
		if(updatedApp){
			if (oldAppID===""){
				setApps(prev => [updatedApp, ...prev]);
				return
			}
			setApps(prev => 
				prev.map(app => (app.id === oldAppID ? updatedApp : app))
			);
			return
		}
		setApps(prev => 
				prev.filter(app => app.id !== oldAppID)
			);
			return
		
	};

	function handleNewApp(newBuildTopic: string) {
		setWaitingBuilds((prev) => prev.includes(newBuildTopic) ? prev : [
			...prev,
			newBuildTopic,
		]);
	}

	function handleEndBuild(topic: string) {
		setWaitingBuilds((prev) => prev.filter((b) => b !== topic));
		setUpdate(prev => prev + 1)
	}

	const filteredWaitingBuilds = (waitingBuilds || []).filter((item) =>
		item?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const filteredApps = (apps || []).filter((item) =>
		(item?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
		(item?.image || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
		(item?.state?.status || "").toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<AppsContext.Provider value={{ stats, updates, uptime, onBuildStart: handleNewApp, refreshUpdates }}>
		<div className="mt-4">
			{/* Controls Bar */}
			<div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#141414] border border-[#b3078b]/30 p-3 rounded-xl mb-4 w-full">
				<div className="relative w-full sm:w-72">
					<Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
					<input
						type="text"
						placeholder="Search apps by name..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-9 pr-4 py-2 text-sm bg-black border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#b3078b] transition-all"
					/>
				</div>

				<div className="flex items-center gap-3 w-full sm:w-auto justify-end">
					{isAdmin && <AppCreator onAppUpdate={handleNewApp} variant="button" />}

					<div className="flex items-center bg-black border border-zinc-800 p-0.5 rounded-lg">
						<button
							onClick={() => handleViewModeChange("card")}
							className={`p-1.5 rounded-md transition-colors cursor-pointer ${
								viewMode === "card"
									? "bg-[#b3078b] text-white"
									: "text-gray-400 hover:text-white"
							}`}
							title="Grid View"
						>
							<LayoutGrid className="h-4 w-4" />
						</button>
						<button
							onClick={() => handleViewModeChange("list")}
							className={`p-1.5 rounded-md transition-colors cursor-pointer ${
								viewMode === "list"
									? "bg-[#b3078b] text-white"
									: "text-gray-400 hover:text-white"
							}`}
							title="List View"
						>
							<List className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>

			{/* Views Content */}
			{viewMode === "card" ? (
				<div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-2 w-full">
					{filteredWaitingBuilds?.map((item) => (
						<AppBuildingCard key={item} appName={item} end={() => handleEndBuild(item)}/>
					))}
					{filteredApps?.map((item) => (
						<AppCard key={item.id} item={item} onAppUpdate={handleAppUpdate} />
					))}
					{filteredWaitingBuilds.length === 0 && filteredApps.length === 0 && (
						<div className="py-8 text-center text-gray-500 w-full">
							No apps found matching your search.
						</div>
					)}
				</div>
			) : (
				<AppListTable
					apps={filteredApps}
					waitingBuilds={filteredWaitingBuilds}
					onAppUpdate={handleAppUpdate}
					onEndBuild={handleEndBuild}
				/>
			)}
		</div>
		</AppsContext.Provider>
	);
}
