"use client"
import React, { useEffect, useState } from "react";
import App, {WaitingBuild} from "../Interfaces/Apps";
import AppCard from "./AppCard";
import Api from "@/Components/Api";
import toast from "react-hot-toast";
import AppCreator from "./AppCreator";
import AppBuildingCard from "./AppBuildingCard";

export default function Apps() {
	const [apps, setApps] = useState<Array<App>>([])
	const [waitingBuilds, setWaitingBuilds] = useState<Array<string>>([])
	const [update, setUpdate] = useState(0)

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
	},[])

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

	return (
		<div className="flex flex-wrap gap-4 justify-center items-center mt-2">
			<AppCreator onAppUpdate={handleNewApp} />
			{apps?.map((item) => (
				<AppCard key={item.id} item={item} onAppUpdate={handleAppUpdate} />
			))}
			{waitingBuilds?.map((item) => (
				<AppBuildingCard key={item} appName={item} end={() => handleEndBuild(item)}/>
			))}
		</div>
	);
}
