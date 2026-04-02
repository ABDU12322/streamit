import { NextRequest, NextResponse } from "next/server";

export interface AuthUser {
    userId: string;
    username: string;
}

export function getAuthUser(request: NextRequest): AuthUser | null {
    const userId = request.cookies.get("userId")?.value;
    const username = request.cookies.get("username")?.value;
    const authToken = request.cookies.get("authToken")?.value;

    if (!userId || !username || !authToken) {
        return null;
    }

    return { userId, username };
}

export function requireAuth(request: NextRequest): { user: AuthUser; error: null } | { user: null; error: NextResponse } {
    const user = getAuthUser(request);

    if (!user) {
        return {
            user: null,
            error: NextResponse.json(
                { error: "Unauthorized: Please login first" },
                { status: 401 }
            ),
        };
    }

    return { user, error: null };
}
