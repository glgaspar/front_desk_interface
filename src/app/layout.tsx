import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import Api from "@/Components/Api";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Front Desk",
	description: "Interface for Front Desk Application",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {

	Api().get("/validate")
	.then(response => {
		console.log("user is valid:", response.data);
	}).catch(error => {
		if (error.status === 401 || error.status === 403) {
			window.location.href = "/login";
			return;
		}
		if (error.status === 404) {
			window.location.href = "/register";
			return;
		}
		console.error("API Error:", error);
		alert("An error occurred while validating the user.");
		window.location.href = "/login";
	});
	

	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<header>
					<div className="header flex justify-center items-center p-4 border-b border-[#b3078b]"> 
						<h2>Péssima Ideia</h2>
					</div>
				</header>
				{children}
			</body>
		</html>
	);
}
