"use client"
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDown, Copy, Maximize2, Minimize2, WrapText, X } from "lucide-react";

const MAX_LINES = 5000;

// keeps the last 5000 lines, a container that logs a lot would eat the browser alive
export function appendLine(prev: string[], line: string) {
	const next = [...prev, line];
	return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
}

// lines that are ours and not from the container, shown dimmed
export function systemLine(text: string) {
	return "\x1b[2m" + text + "\x1b[0m";
}

const palette: Record<number, string> = {
	30: "#6b7280", 31: "#f87171", 32: "#4ade80", 33: "#facc15", 34: "#60a5fa", 35: "#e04fbf", 36: "#22d3ee", 37: "#e5e7eb",
	90: "#9ca3af", 91: "#fca5a5", 92: "#86efac", 93: "#fde047", 94: "#93c5fd", 95: "#f0abfc", 96: "#67e8f9", 97: "#ffffff",
};

interface Segment {
	text: string
	color?: string
	bold?: boolean
	dim?: boolean
}

// just enough ansi to make docker logs look right: colors, bold and dim. everything else gets thrown away
function parseAnsi(raw: string): Segment[] {
	// progress bars rewrite the same line with \r, only the last version matters
	const line = raw.includes("\r") ? raw.slice(raw.lastIndexOf("\r", raw.length - 2) + 1).replace(/\r$/, "") : raw;
	const clean = line.replace(/\x1b\][^\x07]*(\x07|\x1b\\)/g, "");

	const segments: Segment[] = [];
	let state: Omit<Segment, "text"> = {};
	let last = 0;
	const regex = /\x1b\[([0-9;]*)([A-Za-z])/g;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(clean)) !== null) {
		if (match.index > last) segments.push({ ...state, text: clean.slice(last, match.index) });
		last = regex.lastIndex;
		if (match[2] !== "m") continue;

		const codes = match[1] === "" ? [0] : match[1].split(";").map(Number);
		for (const code of codes) {
			if (code === 0) state = {};
			else if (code === 1) state = { ...state, bold: true };
			else if (code === 2) state = { ...state, dim: true };
			else if (code === 22) state = { ...state, bold: false, dim: false };
			else if (code === 39) state = { ...state, color: undefined };
			else if (palette[code]) state = { ...state, color: palette[code] };
		}
	}
	if (last < clean.length) segments.push({ ...state, text: clean.slice(last) });
	return segments;
}

function stripAnsi(raw: string) {
	return parseAnsi(raw).map(s => s.text).join("");
}

export default function Terminal({ title, lines, live, status, close }: { title: string, lines: string[], live: boolean, status?: string, close: () => void }) {
	const windowRef = useRef<HTMLDivElement>(null);
	const bodyRef = useRef<HTMLDivElement>(null);
	const [following, setFollowing] = useState(true);
	const [wrap, setWrap] = useState(true);
	const [fullscreen, setFullscreen] = useState(false);
	const [fakeFullscreen, setFakeFullscreen] = useState(false);

	const parsed = useMemo(() => lines.map(parseAnsi), [lines]);

	// only follows the output if you are already at the bottom, scrolling up to read stops it
	useLayoutEffect(() => {
		if (following && bodyRef.current) {
			bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
		}
	}, [parsed, following, wrap, fullscreen, fakeFullscreen]);

	useEffect(() => {
		const onChange = () => setFullscreen(document.fullscreenElement === windowRef.current);
		document.addEventListener("fullscreenchange", onChange);
		return () => {
			document.removeEventListener("fullscreenchange", onChange);
			if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
		};
	}, []);

	function onScroll() {
		const el = bodyRef.current;
		if (!el) return;
		setFollowing(el.scrollHeight - el.scrollTop - el.clientHeight < 24);
	}

	function jumpToBottom() {
		setFollowing(true);
		if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
	}

	function toggleFullscreen() {
		// the real one when the browser lets us, otherwise just cover the page
		if (document.fullscreenEnabled && windowRef.current) {
			if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
			else windowRef.current.requestFullscreen().catch(() => setFakeFullscreen(prev => !prev));
			return;
		}
		setFakeFullscreen(prev => !prev);
	}

	function copyAll() {
		navigator.clipboard?.writeText(lines.map(stripAnsi).join("\n"))
			.then(() => toast.success("Logs copied"))
			.catch(() => toast.error("Could not copy"));
	}

	function closeTerminal() {
		if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
		close();
	}

	const big = fullscreen || fakeFullscreen;
	const iconButton = "p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer";

	return (
		<div className="fixed inset-0 bg-black/60 z-30 flex items-start justify-center px-2" onClick={closeTerminal}>
			<div
				ref={windowRef}
				onClick={e => e.stopPropagation()}
				className={`flex flex-col bg-[#0c0c0c] border border-[#b3078b]/60 shadow-2xl overflow-hidden ${
					big ? "fixed inset-0 w-screen h-screen rounded-none border-0" : "mt-[2rem] w-[95vw] md:w-[60rem] h-[75dvh] rounded-lg"
				}`}
			>
				<div className="flex items-center gap-3 px-3 py-2 bg-[#161616] border-b border-zinc-800 shrink-0">
					<div className="flex items-center gap-1.5 shrink-0">
						<button type="button" onClick={closeTerminal} className="h-3 w-3 rounded-full bg-[#ff5f57] hover:brightness-125 cursor-pointer" title="Close" />
						<span className="h-3 w-3 rounded-full bg-[#febc2e]" />
						<button type="button" onClick={toggleFullscreen} className="h-3 w-3 rounded-full bg-[#28c840] hover:brightness-125 cursor-pointer" title="Fullscreen" />
					</div>
					<p className="flex-1 min-w-0 truncate text-center font-mono text-xs text-zinc-400" title={title}>{title}</p>
					<span className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 shrink-0">
						<span className={`h-2 w-2 rounded-full ${live ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
						{status || (live ? "live" : "ended")}
					</span>
					<div className="flex items-center gap-1 shrink-0">
						<button type="button" onClick={() => setWrap(prev => !prev)} className={`${iconButton} ${wrap ? "text-[#e04fbf]" : ""}`} title={wrap ? "Stop wrapping lines" : "Wrap lines"}>
							<WrapText className="h-4 w-4" />
						</button>
						<button type="button" onClick={copyAll} className={iconButton} title="Copy everything">
							<Copy className="h-4 w-4" />
						</button>
						<button type="button" onClick={toggleFullscreen} className={iconButton} title={big ? "Exit fullscreen" : "Fullscreen"}>
							{big ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
						</button>
						<button type="button" onClick={closeTerminal} className={iconButton} title="Close">
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>

				<div className="relative flex-1 min-h-0">
					<div ref={bodyRef} onScroll={onScroll} className="absolute inset-0 overflow-auto py-2 font-mono text-[13px] leading-5 text-zinc-200 select-text">
						{parsed.length === 0 && <p className="px-4 text-zinc-600">waiting for output...</p>}
						{parsed.map((segments, index) => (
							<div key={index} className="flex hover:bg-white/[0.03]">
								<span className="w-12 shrink-0 pr-3 text-right text-zinc-600 select-none">{index + 1}</span>
								<span className={`pr-4 ${wrap ? "whitespace-pre-wrap break-all" : "whitespace-pre"}`}>
									{segments.map((s, i) => (
										<span key={i} style={{ color: s.color }} className={`${s.bold ? "font-bold" : ""} ${s.dim ? "opacity-60" : ""}`}>{s.text}</span>
									))}
									{live && index === parsed.length - 1 && <span className="inline-block w-2 h-4 ml-0.5 align-text-bottom bg-zinc-300 animate-pulse" />}
								</span>
							</div>
						))}
					</div>

					{!following && (
						<button type="button" onClick={jumpToBottom} className="absolute bottom-4 right-6 flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#b3078b] text-white text-xs shadow-lg hover:bg-[#920671] cursor-pointer">
							<ArrowDown className="h-3 w-3" /> new lines
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
