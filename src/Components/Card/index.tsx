import React from "react";

interface CardProps {
	children: React.ReactNode;
	className?: string 
}

const Card: React.FC<CardProps> = ({ className,children }) => {
	return (
		<div className={`border-solid border-[#b3078b] border-[1px] rounded-xl p-3 m-1 ${className}`}>
			{children}
		</div>
	);
};

export default Card;
