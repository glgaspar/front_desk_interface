"use client"
import { createContext, useContext } from "react";
import App, { AppStats, UpdateStatus } from "../../Interfaces/Apps";

// stuff every card needs but i dont want to pass through 4 components
interface AppsContextData {
	stats: AppStats[]
	updates: Record<string, UpdateStatus>
	onBuildStart: (topic: string) => void
	refreshUpdates: (force?: boolean) => void
}

export const AppsContext = createContext<AppsContextData>({
	stats: [],
	updates: {},
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
