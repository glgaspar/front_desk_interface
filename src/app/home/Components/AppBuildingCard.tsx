import Modal from "@/Components/Modal/Modal";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Card from "@/Components/Card";
import dockerSVG from "@/Components/Static/docker-svgrepo-com.svg";
import Popup from "reactjs-popup";
import { EventConsumer } from "@/Components/Api";
import { PopupActions } from "reactjs-popup/dist/types";

export default function AppBuildingCard({appName, end}: {appName: string; end: () => void}) {
	const [messages, setMessages] = useState<string[]>([]);
	const ref = useRef<PopupActions>(null);

	useEffect(() => {
		const eventSource = EventConsumer("/apps/waitingBuilds/" + appName)
		eventSource.onmessage = (event) => {
			const msg = event.data;
			if (msg) {
				setMessages((prev) => [...prev, msg]);
				if (msg.includes("no active build") || msg.includes("stream closed")) {
					end();
				}
			}
		};

		eventSource.onerror = (err) => {
			console.error("EventSource failed:", err);
			eventSource.close();
			end();
		};

		return () => {
			eventSource.close();
		};
	}, [appName]);

	return (
		<Card className="w-36 h-36" key={appName}>
			<div>
				<div className="h-8 w-full text-center">
					<p>{appName}</p>
				</div>
				<div>
					<Image
						src={dockerSVG}
						alt={appName}
						className="m-auto h-10 w-10 rounded-lg"
						width={40}
						height={40}
						unoptimized
					/>
				</div>
				<p className="mt-2 text-center text-xs">
					{appName.toUpperCase()}
				</p>
			</div>
			<div className="px-5 grid grid-cols-2 gap-3">
				<div className="w-8 h-8">
					<Popup
						ref={ref}
						modal
						nested
						trigger={
							<div
								className="bg-none text-[1.5rem] text-center w-8 h-8 cursor-pointer "
								id="building"
							>
								&#9881;
							</div>
						}
					>
						<Modal
							title={"Logs: " + appName}
							close={() => ref.current?.close()}
							className="border border-[#b3078b] bg-black md:w-220"
						>
							<div>
								<pre className="bg-black border border-[#b3078b] text-white p-4 h-[60vh] overflow-y-scroll whitespace-pre-wrap wrap-break-word">
									{messages.map((msg, index) => (
										<div key={index}>{msg}</div>
									))}
									<div
										ref={(el) => {
											if (el) {
												el.scrollIntoView({
													behavior: "smooth",
												});
											}
										}}
									/>
								</pre>
							</div>
						</Modal>
					</Popup>
				</div>
			</div>
		</Card>
	);
}
