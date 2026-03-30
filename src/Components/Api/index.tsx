import axios from "axios";

export default function Api() {
	var credentials = true;
	if (process.env.NEXT_PUBLIC_ENV == "DEV") {
		credentials = false;
	}

	return axios.create({
		baseURL: process.env.NEXT_PUBLIC_API_URL,
		withCredentials: credentials,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export function EventConsumer(endPoint: string) {
	var credentials = true;
	if (process.env.NEXT_PUBLIC_ENV == "DEV") {
		credentials = false;
	}

	return new EventSource(
		process.env.NEXT_PUBLIC_API_URL + endPoint,
		{ withCredentials: credentials },
	);
}
