import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { Toaster } from 'react-hot-toast';

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
				<Toaster position="top-right" reverseOrder={false} />
			</body>
		</html>
	);
}
