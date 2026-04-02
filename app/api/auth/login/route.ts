import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/server/database/connection";
import { User } from "@/src/server/models/userModel";
import crypto from "crypto";

// Simple password hashing (in production, use bcryptjs)
function hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        const user = await User.findOne({ username });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 401 }
            );
        }

        const hashedPassword = hashPassword(password);

        if (user.password !== hashedPassword) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 401 }
            );
        }

        // Create session token
        const token = crypto.randomBytes(32).toString("hex");

        const response = NextResponse.json(
            {
                message: "Login successful",
                user: {
                    userId: user._id.toString(),
                    username: user.username,
                },
            },
            { status: 200 }
        );

        // Set HTTP-only cookies
        response.cookies.set({
            name: "authToken",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        response.cookies.set({
            name: "userId",
            value: user._id.toString(),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        response.cookies.set({
            name: "username",
            value: user.username,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        console.log("Request body:", await request.text());
        return NextResponse.json(
            { error: "Failed to login" },
            { status: 500 }
        );
    }
}
