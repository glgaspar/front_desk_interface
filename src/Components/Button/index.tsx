import React from "react";

interface Button extends React.ComponentProps<"button">{
	id: string;
	type: "submit" | "reset" | "button" | undefined,
	children: React.ReactNode;
	className?: string;
	onClick?: () => void
}

export default function Button(props:Button) {
	return (
		<button {...{...props, className:props.className ? props.className : "cursor-pointer bg-[#b3078b]"}} />
	);
}
