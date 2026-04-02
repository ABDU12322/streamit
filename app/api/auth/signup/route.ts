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

        // Check if user already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return NextResponse.json(
                { error: "Username already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = hashPassword(password);

        const newUser = new User({
            username,
            password: hashedPassword,
        });

        await newUser.save();

        // Create session token
        const token = crypto
            .randomBytes(32)
            .toString("hex");

        const response = NextResponse.json(
            {
                message: "User registered successfully",
                user: { 
                    userId: newUser._id.toString(), 
                    username: newUser.username 
                },
            },
            { status: 201 }
        );

        // Set HTTP-only cookie with token
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
            value: newUser._id.toString(),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        response.cookies.set({
            name: "username",
            value: newUser.username,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Failed to register user" },
            { status: 500 }
        );
    }
}
