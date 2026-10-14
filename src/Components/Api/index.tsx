import axios, { AxiosInstance } from "axios";

let api: AxiosInstance | null = null;

export default function Api() {
	if (api) return api;

	let credentials = true;
	if (process.env.NEXT_PUBLIC_ENV == "DEV") {
		credentials = false;
	}

	api = axios.create({
		baseURL: process.env.NEXT_PUBLIC_API_URL,
		withCredentials: credentials,
		headers: {
			"Content-Type": "application/json",
		},
	});

	// session died while you were using it, back to login
	api.interceptors.response.use(
		(response) => response,
		(error) => {
			if (
				typeof window !== "undefined" &&
				error?.response?.status === 401 &&
				!window.location.pathname.startsWith("/login") &&
				!window.location.pathname.startsWith("/register") &&
				!error?.config?.url?.includes("/login")
			) {
				window.location.href = "/login";
			}
			return Promise.reject(error);
		}
	);

	return api;
}

// for things that only happen on the screen (opening a page, a modal...). never breaks anything if it fails
export function track(action: string, target = "") {
	Api()
		.post("/activity", { action, target })
		.catch(() => {});
}

export function EventConsumer(endPoint: string) {
	let credentials = true;
	if (process.env.NEXT_PUBLIC_ENV == "DEV") {
		credentials = false;
	}

	return new EventSource(
		process.env.NEXT_PUBLIC_API_URL + endPoint,
		{ withCredentials: credentials },
	);
}
