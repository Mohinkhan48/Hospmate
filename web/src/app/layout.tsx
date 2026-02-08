import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "K-Voice Dashboard",
    description: "Kannada Patient Notifier Monitoring",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
                <nav className="border-b border-slate-800 p-4 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                            K-Voice
                        </h1>
                        <div className="flex gap-4 text-sm font-medium">
                            <span className="text-slate-400">Status:</span>
                            <span className="text-emerald-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Connected
                            </span>
                        </div>
                    </div>
                </nav>
                <main className="max-w-7xl mx-auto p-6">
                    {children}
                </main>
            </body>
        </html>
    );
}
