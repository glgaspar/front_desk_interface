import React from "react";

interface Button extends React.ComponentProps<"button">{
	id: string;
	children: React.ReactNode;
	role?: "action" | "menuitem" | "option" | "switch" | "tab" | "generic" | "cancel";
	className?: string;
}

const roleMapper = {
	action : "cursor-pointer border border-[#b3078b] bg-[#a71986] hover:bg-[#920671] text-sm text-center px-2 py-1 transition-colors",
	menuitem : "w-full text-left px-4 py-2 text-sm cursor-pointer hover:bg-[#b3078b] text-sm text-center px-2 py-1 transition-colors",
	option : "cursor-pointer hover:bg-[#b3078b] text-sm text-center px-2 py-1 transition-colors",
	switch : "cursor-pointer border border-[#b3078b] hover:bg-[#a71986] text-sm text-center px-2 py-1 transition-colors",
	tab : "cursor-pointer border border-[#b3078b] hover:bg-[#b3078b] text-sm text-center px-2 py-1 transition-colors",
	generic : "cursor-pointer",
	cancel: "cursor-pointer border border-[#b3078b] hover:bg-red-800 hover:border-gray-800 transition-colors text-sm text-center px-2 py-1"
}

export default function Button({ role = "generic", ...props }: Button) {
	return (
		<button {...{...props, className: roleMapper[role] + " " + props.className }} />
	);
}
