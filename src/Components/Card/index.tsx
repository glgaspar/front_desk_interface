import React from "react";

interface CardProps {
	children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => {
	return (
		<div className="border-solid border-[#b3078b] border-[1px] rounded-xl p-3 m-1">
			{children}
		</div>
	);
};

export default Card;
