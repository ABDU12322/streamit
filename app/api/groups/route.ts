import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/server/database/connection";
import { Group } from "@/src/server/models/groupModel";
import { requireAuth } from "@/src/server/utils/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const auth = requireAuth(req);
        if (auth.error) {
            return auth.error;
        }

        await connectDB();
        
        const body = await req.json();
        const { name, description } = body;
        const createdBy = auth.user?.username;
        
        if (!name || !createdBy) {
            return NextResponse.json(
                { error: "Name and createdBy are required" },
                { status: 400 }
            );
        }

        const groupID = uuidv4();
        
        const newGroup = new Group({
            groupID,
            name,
            description: description || "",
            createdBy,
            videoCount: 0,
        });

        await newGroup.save();

        return NextResponse.json(
            {
                message: "Group created successfully",
                group: newGroup,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating group:", error);
        return NextResponse.json(
            { error: "Failed to create group" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        // Check authentication
        const auth = requireAuth(req);
        if (auth.error) {
            return auth.error;
        }

        await connectDB();
        
        const groups = await Group.find({}).sort({ createdDate: -1 });
        
        return NextResponse.json({ groups }, { status: 200 });
    } catch (error) {
        console.error("Error fetching groups:", error);
        return NextResponse.json(
            { error: "Failed to fetch groups" },
            { status: 500 }
        );
    }
}
