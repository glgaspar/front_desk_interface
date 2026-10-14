"use client"
import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Api, { track } from "@/Components/Api";

export interface CurrentUser {
	id: number
	userName: string
	isAdmin: boolean
}

interface UserContextData {
	user: CurrentUser | null
	isAdmin: boolean
	refresh: () => void
}

const UserContext = createContext<UserContextData>({ user: null, isAdmin: false, refresh: () => {} });

function publicPage(path: string | null) {
	return !path || path.startsWith("/login") || path.startsWith("/register");
}

// who is logged in, so the pages know what to hide. the api says no anyway, this is just to not show buttons that wont work
export function UserProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<CurrentUser | null>(null);
	const [refreshCount, setRefreshCount] = useState(0);
	const pathname = usePathname();
	const onPublicPage = publicPage(pathname);

	useEffect(() => {
		if (onPublicPage) {
			setUser(null);
			return;
		}
		Api()
			.get("/me")
			.then((response) => setUser(response?.data?.data || null))
			.catch((error) => console.error(error));
	}, [onPublicPage, refreshCount]);

	// every page someone opens goes to the activity log
	useEffect(() => {
		if (onPublicPage || !pathname) return;
		track("opened page", pathname);
	}, [pathname, onPublicPage]);

	return (
		<UserContext.Provider value={{ user, isAdmin: user?.isAdmin === true, refresh: () => setRefreshCount(prev => prev + 1) }}>
			{children}
		</UserContext.Provider>
	);
}

export function useUser() {
	return useContext(UserContext);
}
