import { NextRequest, NextResponse } from "next/server";
import { video } from "@/src/server/types/video";
import { connectDB } from "@/src/server/database/connection";
import { Video } from "@/src/server/models/videoModel";
import { Group } from "@/src/server/models/groupModel";
import { requireAuth } from "@/src/server/utils/auth";

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const auth = requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        await connectDB();
        
        const groups = await Group.find({}).sort({ createdDate: -1 });
        const videos: video[] = await Video.find({ groupId: null }).sort({ uploadDate: -1 });
        
        return NextResponse.json({ groups, videos });
    } catch (error) {
        console.error("Error fetching dashboard data", error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}



export async function POST(request: NextRequest){
    try{
        await connectDB();
        const formData = await request.json();
        const searchQuery = formData.search;

        if (!searchQuery || searchQuery.trim() === "") {
            const videos: video[] = await Video.find({});
            return NextResponse.json({ videos });
        }

        const videos: video[] = await Video.find({
            $or: [
                { title: { $regex: searchQuery, $options: "i" } },
                { description: { $regex: searchQuery, $options: "i" } }
            ]
        });

        return NextResponse.json({ videos });
    }
    catch(e){
        console.error("Error searching videos", e);
        return NextResponse.json({error: "Failed to search videos"},{status: 500});
    }
}