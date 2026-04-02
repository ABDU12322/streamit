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
        <nav className="sticky top-0 z-50 border-b border-emerald-200/70 bg-white/90 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/dashboard" className="text-xl font-bold tracking-tight text-emerald-900">
                    StreamIt
                </Link>

                <ul className="flex items-center gap-2 text-sm font-medium text-slate-600 sm:gap-3">
                    <li>
                        <Link
                            href="/dashboard"
                            className="rounded-md px-3 py-2 text-black transition hover:bg-emerald-500"
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/upload-video"
                            className="rounded-md px-3 py-2 text-black transition hover:bg-emerald-500"
                        >
                            Upload Video
                        </Link>
                    </li>
                    <li>
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-3 py-2 transition cursor-pointer"
                        >
                            {loading ? "Logging out..." : "Logout"}
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}