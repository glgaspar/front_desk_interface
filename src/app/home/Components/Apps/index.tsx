"use client"
import React, { useEffect, useState } from "react";
import App from "../../Interfaces/Apps";
import AppCard from "../../Components/AppCard";
import Api from "@/Components/Api";
import toast from "react-hot-toast";

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

    function replaceApp(app:App){
        setApps(prev =>
            prev.map(prevApp =>
            prevApp.id === app.id ? app : prevApp
            )
        );
    }

	return (
		<div className="flex flex-wrap gap-4 justify-center items-center mt-5">
			{apps?.map((item) => (
				<AppCard key={item.id} item={item} replace={replaceApp} />
			))}
		</div>
	);
}
