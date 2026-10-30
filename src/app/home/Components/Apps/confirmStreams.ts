import Api from "@/Components/Api";
import App from "../../Interfaces/Apps";
import { JellyfinStream } from "@/app/widgets/Interfaces";

// asks before restarting/updating/stopping jellyfin while someone is watching.
// if jellyfin is not configured or doesnt answer it just lets you go ahead
export async function confirmStreams(app: App, action: string) {
	if (!app.imageRef?.toLowerCase().includes("jellyfin")) return true;

	let streams: JellyfinStream[] = [];
	try {
		const res = await Api().get("/jellyfin/streams");
		streams = res?.data?.data || [];
	} catch {
		return true;
	}
	if (streams.length === 0) return true;

	const who = streams.map(s => `${s.user} (${s.series ? s.series + " " : ""}${s.title})`).join(", ");
	const people = streams.length === 1 ? "1 person is" : `${streams.length} people are`;
	return confirm(`${people} streaming on Jellyfin: ${who}. ${action} anyway?`);
}
