import React from "react";

interface Button {
	id: string;
	type: "submit" | "reset" | "button" | undefined,
	children: React.ReactNode;
	className?: string;
	onClick: () => void
}

export default function Button(props:Button) {
	return (
		<button
			id={props.id}
			className={props.className ? props.className : "cursor-pointer bg-[#b3078b]"}
			type={props.type}
		>
			{props.children}
		</button>
	);
}
