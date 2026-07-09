"use client"
import React from "react";
import App from "../Interfaces/Apps";
import AppBuildingRow from "./AppBuildingRow";
import AppRow from "./AppRow";

interface AppListTableProps {
	apps: Array<App>;
	waitingBuilds: Array<string>;
	onAppUpdate: (oldAppID: string, updatedApp: App | null) => void;
	onEndBuild: (topic: string) => void;
}

export default function AppListTable({apps,waitingBuilds,onAppUpdate,onEndBuild}: AppListTableProps) {
	return (
		<div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-[#0d0d0d]">
			<table className="w-full border-collapse text-left text-sm text-zinc-300">
				<thead className="bg-[#141414] border-b border-[#b3078b]/30 text-xs uppercase tracking-wider text-gray-400">
					<tr>
						<th className="py-3 px-4">App</th>
						<th className="py-3 px-4">Status</th>
						<th className="py-3 px-4">URL</th>
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
							<td colSpan={4} className="py-8 text-center text-gray-500">
								No apps found matching your search.
							</td>
						</tr>
					) : (
						apps.map((item) => (
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
