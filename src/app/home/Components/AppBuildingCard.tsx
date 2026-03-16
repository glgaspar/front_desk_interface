import Modal from "@/Components/Modal/Modal";
import { useEffect } from "react";

export default function AppBuildingCard({topic,messages,}: {topic: string;messages: string[];updateTopic: (topic: string) => void;close:()=>void}) {
		// this is a place holder for the kafka consumer. 
        // no idea if i should stream it from the api or consume directly, 
        // but why not go to the source right????
        useEffect(() => {
			const eventSource = new EventSource(
				`${process.env.NEXT_PUBLIC_API_URL}/apps/build-status/${topic}`,
				{ withCredentials: true }
			);

			eventSource.onmessage = (event) => {
				const data = JSON.parse(event.data);
				
				if (data.status === "completed") {
                    close();
					eventSource.close();
					return;
				}
			};

			eventSource.onerror = () => {
				eventSource.close();
			};

			return () => eventSource.close();
		}, [topic]);

		return (
            <Modal
                title={"Logs: " + topic}
                close={() => close()}
                className="border border-[#b3078b] bg-black md:w-[55rem]"
            >
                <div>
                    <pre className="bg-black border border-[#b3078b] text-white p-4 h-[60vh] overflow-y-scroll whitespace-pre-wrap break-words">
                        {messages.map((msg, index) => (
                            <div key={index}>{msg}</div>
                        ))}
                    </pre>					
                    <div ref={(el) => {
                        if (el) {
                            el.scrollIntoView({ behavior: "smooth" });
                        }
                    }} />

                </div>
            </Modal>
		);
	}