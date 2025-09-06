import { RefObject, useEffect } from "react";

export const useClickOutside = (ref: RefObject<HTMLElement | null>, callback: () => void, addEventListener = true, ignoreId:undefined|string = undefined) => {
	const handleClick = (event:Event) => {
		if (ignoreId != null && (event?.target as HTMLElement)?.id == ignoreId) {
			return;
		}
		if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
			callback();
		}
	};

	useEffect(() => {
		if (addEventListener) {
			document.addEventListener("click", handleClick);
		}

		return () => {
			document.removeEventListener("click", handleClick);
		};
	});
};