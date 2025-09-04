import React from "react";
import Hardware from "./Components/Hardware ";
import Apps from "./Components/Apps";

export default function Home() {
	return (
		<div className="m-auto w-[95vw]">
			<div className="">
				{/* TODO: quick view for widgets (integration with stuff i use) */}
				{/* <div className='grid grid-flow-col overflow-x-scroll p-1'>
            <Card className='w-[25rem] h-[9rem]'><></></Card>
            <Card className='w-[25rem] h-[9rem]'><></></Card>
            <Card className='w-[25rem] h-[9rem]'><></></Card>
            <Card className='w-[25rem] h-[9rem]'><></></Card>
            <Card className='w-[25rem] h-[9rem]'><></></Card>
            <Card className='w-[25rem] h-[9rem]'><></></Card>
            <Card className='w-[25rem] h-[9rem]'><></></Card>
            <Card className='w-[25rem] h-[9rem]'><></></Card>
            <Card className='w-[25rem] h-[9rem]'><></></Card>
          </div> */}
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
