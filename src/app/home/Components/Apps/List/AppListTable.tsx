"use client"
import React, { useContext, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import App from "../../../Interfaces/Apps";
import AppBuildingRow from "./AppBuildingRow";
import AppRow from "./AppRow";
import { AppsContext, findStats, findUptime } from "../AppsContext";

interface AppListTableProps {
	apps: Array<App>;
	waitingBuilds: Array<string>;
	onAppUpdate: (oldAppID: string, updatedApp: App | null) => void;
	onEndBuild: (topic: string) => void;
}

type SortKey = "name" | "status" | "uptime" | "cpu" | "mem" | "url";
interface Sort {
	key: SortKey;
	dir: "asc" | "desc";
}

const columns: { key: SortKey; label: string }[] = [
	{ key: "name", label: "App" },
	{ key: "status", label: "Status" },
	{ key: "uptime", label: "Uptime" },
	{ key: "cpu", label: "CPU" },
	{ key: "mem", label: "Mem" },
	{ key: "url", label: "URL" },
];

export default function AppListTable({apps,waitingBuilds,onAppUpdate,onEndBuild}: AppListTableProps) {
	const { stats, uptime } = useContext(AppsContext);
	const [sort, setSort] = useState<Sort>({ key: "name", dir: "asc" });

	useEffect(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("front_desk_sort") || "null");
			if (saved && columns.some(c => c.key === saved.key) && (saved.dir === "asc" || saved.dir === "desc")) {
				setSort(saved);
			}
		} catch {}
	}, []);

	function changeSort(key: SortKey) {
		const next: Sort = sort.key === key ? { key, dir: sort.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" };
		setSort(next);
		try {
			localStorage.setItem("front_desk_sort", JSON.stringify(next));
		} catch {}
	}

	function value(app: App): string | number | undefined {
		switch (sort.key) {
			case "name": return (app.name || "").toLowerCase();
			case "status": return app.state?.status || "";
			case "url": return (app.url || "").toLowerCase();
			case "cpu": return findStats(stats, app)?.cpuPercent;
			case "mem": return findStats(stats, app)?.memPercent;
			case "uptime": return findUptime(uptime, app)?.uptimePercent;
		}
	}

	// the ones without a value (stopped apps have no cpu) always go last, no matter the direction
	const sorted = [...apps].sort((a, b) => {
		const va = value(a);
		const vb = value(b);
		if (va === undefined && vb === undefined) return 0;
		if (va === undefined) return 1;
		if (vb === undefined) return -1;
		const result = va < vb ? -1 : va > vb ? 1 : 0;
		return sort.dir === "asc" ? result : -result;
	});

	return (
		<div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-[#0d0d0d]">
			<table className="w-full border-collapse text-left text-sm text-zinc-300">
				<thead className="bg-[#141414] border-b border-[#b3078b]/30 text-xs uppercase tracking-wider text-gray-400">
					<tr>
						{columns.map(column => (
							<th
								key={column.key}
								className="py-3 px-4 cursor-pointer select-none hover:text-white transition-colors"
								onClick={() => changeSort(column.key)}
								aria-sort={sort.key === column.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
							>
								<span className={`inline-flex items-center gap-1 ${sort.key === column.key ? "text-white" : ""}`}>
									{column.label}
									{sort.key === column.key && (sort.dir === "asc"
										? <ChevronUp className="h-3 w-3 text-[#b3078b]" />
										: <ChevronDown className="h-3 w-3 text-[#b3078b]" />)}
								</span>
							</th>
						))}
						<th className="py-3 px-4 text-right">Actions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-zinc-800/40">
					{waitingBuilds.map((item) => (
						<AppBuildingRow
							key={item}
							appName={item}
							end={() => onEndBuild(item)}
						/>
					))}
					{apps.length === 0 && waitingBuilds.length === 0 ? (
						<tr>
							<td colSpan={7} className="py-8 text-center text-gray-500">
								No apps found matching your search.
							</td>
						</tr>
					) : (
						sorted.map((item) => (
							<AppRow
								key={item.id}
								item={item}
								onAppUpdate={onAppUpdate}
							/>
						))
					)}
				</tbody>
			</table>
		</div>
	);
}
