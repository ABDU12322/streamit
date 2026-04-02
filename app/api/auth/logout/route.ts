import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json(
            { message: "Logged out successfully" },
            { status: 200 }
        );

        // Clear cookies
        response.cookies.delete("authToken");
        response.cookies.delete("userId");
        response.cookies.delete("username");

        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { error: "Failed to logout" },
            { status: 500 }
        );
    }
}
