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
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="animate-pulse">
                <p className="text-white text-xl">Redirecting...</p>
            </div>
        </div>
    );
}
