"use client"
import { createContext, useContext } from "react";
import App, { AppStats, UpdateStatus } from "../../Interfaces/Apps";
import { Uptime } from "@/app/monitoring/Interfaces";

// stuff every card needs but i dont want to pass through 4 components
interface AppsContextData {
	stats: AppStats[]
	updates: Record<string, UpdateStatus>
	uptime: Uptime[]
	onBuildStart: (topic: string) => void
	refreshUpdates: (force?: boolean) => void
}

export const AppsContext = createContext<AppsContextData>({
	stats: [],
	updates: {},
	uptime: [],
	onBuildStart: () => {},
	refreshUpdates: () => {},
});

export function useAppStats(app: App) {
	const { stats } = useContext(AppsContext);
	return stats.find(s => s.id && app.id.startsWith(s.id));
}

export function useAppUpdate(app: App) {
	const { updates } = useContext(AppsContext);
	return app.imageRef ? updates[app.imageRef] : undefined;
}

// same key the backend uses, dir + name because container ids change on every rebuild
export function useAppUptime(app: App) {
	const { uptime } = useContext(AppsContext);
	const key = app.dir ? `${app.dir}|${app.name}` : app.name;
	return uptime.find(u => u.appKey === key);
}
