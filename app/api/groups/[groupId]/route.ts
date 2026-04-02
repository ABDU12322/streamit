import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/server/database/connection";
import { Group } from "@/src/server/models/groupModel";
import { requireAuth } from "@/src/server/utils/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ groupId: string }> }
) {
    try {
        // Check authentication
        const auth = requireAuth(req);
        if (auth.error) {
            return auth.error;
        }

        await connectDB();
        const { groupId } = await params;

        if (!groupId) {
            return NextResponse.json(
                { error: "Group ID is required" },
                { status: 400 }
            );
        }

        const group = await Group.findOne({ groupID: groupId });

        if (!group) {
            return NextResponse.json(
                { error: "Group not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ group }, { status: 200 });
    } catch (error) {
        console.error("Error fetching group:", error);
        return NextResponse.json(
            { error: "Failed to fetch group" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ groupId: string }> }
) {
    try {
        // Check authentication
        const auth = requireAuth(req);
        if (auth.error) {
            return auth.error;
        }

        await connectDB();
        const { groupId } = await params;

        if (!groupId) {
            return NextResponse.json(
                { error: "Group ID is required" },
                { status: 400 }
            );
        }

        const result = await Group.deleteOne({ groupID: groupId });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: "Group not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Group deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting group:", error);
        return NextResponse.json(
            { error: "Failed to delete group" },
            { status: 500 }
        );
    }
}
