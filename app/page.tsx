"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserFromCookies } from "@/src/client/utils/cookies";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const user = getCurrentUserFromCookies();
        
        // If user is logged in, redirect to dashboard
        // Otherwise, redirect to login
        if (user) {
            router.push("/dashboard");
        } else {
            router.push("/login");
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-pulse">
                <p className="text-emerald-400 text-xl font-semibold">Redirecting...</p>
            </div>
        </div>
    );
}
