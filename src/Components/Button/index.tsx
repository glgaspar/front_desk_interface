import React from "react";

interface Button extends React.ComponentProps<"button">{
	id: string;
	children: React.ReactNode;
	role?: "action" | "menuitem" | "option" | "switch" | "tab" | "generic";
	className?: string;
}

const roleMapper = {
	action : "cursor-pointer border border-[#b3078b] hover:bg-[#a71986] text-sm text-center px-2 py-1",
	menuitem : "w-full text-left px-4 py-2 text-sm cursor-pointer hover:bg-[#b3078b] text-sm text-center px-2 py-1",
	option : "cursor-pointer hover:bg-[#b3078b] text-sm text-center px-2 py-1",
	switch : "cursor-pointer border border-[#b3078b] hover:bg-[#a71986] text-sm text-center px-2 py-1",
	tab : "cursor-pointer hover:bg-[#b3078b] text-sm text-center px-2 py-1",
	generic : ""
}

export default function Button({ role = "generic", ...props }: Button) {
	return (
		<button {...{...props, className: roleMapper[role] + " " + props.className }} />
	);
}
