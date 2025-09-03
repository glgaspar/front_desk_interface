import React from "react";

interface Button {
	id: string;
	type: "submit" | "reset" | "button" | undefined,
	text: string;
	className?: string;
}

export default function Button(props:Button) {
	return (
		<button
			id={props.id}
			className={props.className ? props.className : "cursor-pointer bg-[#b3078b]"}
			type={props.type}
		>
			{props.text}
		</button>
	);
}
