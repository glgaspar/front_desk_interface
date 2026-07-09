"use client"
import React, { useEffect, useState } from "react";
import App from "../Interfaces/Apps";
import AppCard from "./AppCard";
import Api from "@/Components/Api";
import toast from "react-hot-toast";
import AppCreator from "./AppCreator";
import AppBuildingCard from "./AppBuildingCard";
import { LayoutGrid, List, Search } from "lucide-react";
import AppListTable from "./AppListTable";

export default function Apps() {
	const [apps, setApps] = useState<Array<App>>([])
	const [waitingBuilds, setWaitingBuilds] = useState<Array<string>>([])
	const [update, setUpdate] = useState(0)
	const [viewMode, setViewMode] = useState<"card" | "list">("card")
	const [searchQuery, setSearchQuery] = useState("")

	useEffect(() => {
		Api()
			.get("/apps")
			.then((response) => {
				setApps(response.data.data);
			})
			.catch((error) => {
				toast.error(
					error?.response?.data?.message ||
						"Unknow error fetching apps. Better luck next time..."
				);
			});
	}, [update]);


	useEffect(() => {
		Api()
			.get("/apps/waitingBuilds")
			.then((response) => {
				setWaitingBuilds(response.data.data);
			})
			.catch((error) => {
				toast.error(
					error?.response?.data?.message ||
						"Unknow error fetching builds. Better luck next time..."
				);
			});
	}, [])

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
		setWaitingBuilds((prev) => [
			...prev,
			newBuildTopic,
		]);
	}

	function handleEndBuild(topic: string) {
		setWaitingBuilds((prev) => prev.filter((b) => b !== topic));
		setUpdate(prev => prev + 1)
	}

	const filteredWaitingBuilds = waitingBuilds.filter((item) =>
		item.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const filteredApps = apps.filter((item) =>
		item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		item.image.toLowerCase().includes(searchQuery.toLowerCase()) ||
		item.state.status.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
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
					{viewMode === "list" && (
						<AppCreator onAppUpdate={handleNewApp} variant="button" />
					)}

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
				<div className="flex flex-wrap gap-4 justify-center items-center">
					<AppCreator onAppUpdate={handleNewApp} variant="card" />
					{filteredWaitingBuilds?.map((item) => (
						<AppBuildingCard key={item} appName={item} end={() => handleEndBuild(item)}/>
					))}
					{filteredApps?.map((item) => (
						<AppCard key={item.id} item={item} onAppUpdate={handleAppUpdate} />
					))}
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
	);
}
