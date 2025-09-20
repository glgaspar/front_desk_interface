"use client"
import React, { useEffect, useState } from "react";
import App from "../Interfaces/Apps";
import AppCard from "./AppCard";
import Api from "@/Components/Api";
import toast from "react-hot-toast";
import AppCreator from "./AppCreator";

export default function Apps() {
	const [apps, setApps] = useState<Array<App>>([])

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
	}, []);


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

	return (
		<div className="flex flex-wrap gap-4 justify-center items-center mt-5">
			<AppCreator onAppUpdate={handleAppUpdate} />
			{apps?.map((item) => (
				<AppCard key={item.id} item={item} onAppUpdate={handleAppUpdate} />
			))}
		</div>
	);
}
