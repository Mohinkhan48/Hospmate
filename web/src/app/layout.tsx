import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

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
        <html lang="en" className={inter.variable}>
            <body className="bg-nebula-950 text-slate-200 font-sans min-h-screen selection:bg-indigo-500/30">
                <div className="flex min-h-screen">
                    {/* Fixed Sidebar */}
                    <Sidebar />

                    {/* Main Content Area */}
                    <div className="flex-1 ml-64 flex flex-col min-h-screen relative z-0">
                        <Topbar />

                        <main className="flex-1 p-8 relative">
                            {/* Background Elements */}
                            <div className="fixed inset-0 z-[-1] pointer-events-none">
                                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[100px]" />
                                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[100px]" />
                            </div>

                            {children}
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
}
