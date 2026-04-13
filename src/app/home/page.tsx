import React from "react";
import Hardware from "./Components/Hardware";
import Apps from "./Components/Apps";
import WidgetsRow from "./Components/WidgetsRow";

export default function Home() {
	return (
		<div className="m-auto w-[95vw]">
			<div className="">
				<WidgetsRow />
			</div>
			<div className="m-2 grid sm:grid-cols-1 md:grid-cols-[1fr_5fr] gap-5">
				<div className="">
					<Hardware />
				</div>
				<div className="">
					<Apps />
				</div>
			</div>
		</div>
	);
}
