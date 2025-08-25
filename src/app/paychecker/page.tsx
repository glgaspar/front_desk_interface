"use client";
import React from "react";
import Bill from "./Interfaces/Bill";
import PaycheckerCard from "./Components/PaycheckerCard";
import NewBill from "./Components/NewBill";

export default function Paychecker() {
	const [data, setData] = React.useState<Array<Bill>>([]);
	const [open, setOpen] = React.useState(false);
	return (
		<div className="m-auto w-[75vw]">
			<div>
				<p className="text-center m-5">Bills</p>
				<hr className="" />
				<div className="m-2 grid grid-cols-[1fr_75vw_1fr] gap-5">
					<div></div>
					<div id="paycheckerCardsContainer" className="">
						{data?.map((bill) => (
							<PaycheckerCard key={bill.id} {...bill} />
						))}
					</div>
					<NewBill open={open} close={()=>setOpen(false)} />
					<div className="pt-5">
						<button className="cursor-pointer" onClick={()=>setOpen(true)} >
							ADD NEW
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
