import { NextRequest,NextResponse } from "next/server";
import { video } from "@/src/server/types/video";
import connectDB from "@/src/server/database/connection";
import { Video } from "@/src/server/models/videoModel";
export async function GET(request: NextRequest){
    try{
        await connectDB();
        const videos: video[]=await Video.find();
        console.log("Fetched Videos", videos);
        return NextResponse.json({ videos });
    }catch(error){
        console.error("Error fetching videos", error);
        return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
    }
}



export async function POST(request: NextRequest){
    try{
        await connectDB();
        const formData = await request.formData();
        const searchQuery = formData.get("search") as string;

        if (!searchQuery) {
            return NextResponse.json({ error: "Search query required" }, { status: 400 });
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