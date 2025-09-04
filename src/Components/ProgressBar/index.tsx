import React from "react";

export default function ProgressBar({ color, percentage }:{color: string, percentage:number}) {
	return (
		<div className="w-full h-5 bg-[#e2e2e2] overflow-hidden rounded-[5px]">
			<div
				className={`h-full transition-[width] duration-[0.5s] ease-[ease-in-out]`}
				style={{ width: `calc(${percentage}%)`, background: color }}
			></div>
		</div>
	);
}
