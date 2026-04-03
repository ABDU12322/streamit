"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-slate-900 border-b border-emerald-500/30 backdrop-blur-md shadow-2xl shadow-emerald-500/10">
            <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                        <span className="text-white font-bold text-xl">S</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-400">
                        StreamIt
                    </span>
                </Link>

                <ul className="flex items-center gap-2 text-sm font-medium sm:gap-4">
                    <li>
                        <Link
                            href="/dashboard"
                            className="rounded-lg px-4 py-2 text-emerald-200 transition-all duration-300 hover:bg-emerald-500/20 hover:text-emerald-300"
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/upload-video"
                            className="rounded-lg px-4 py-2 text-emerald-200 transition-all duration-300 hover:bg-emerald-500/20 hover:text-emerald-300"
                        >
                            Upload
                        </Link>
                    </li>
                    <li>
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="rounded-lg px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/30"
                        >
                            {loading ? "Logging out..." : "Logout"}
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}