import { NextResponse,NextRequest } from "next/server";
import {Video as videoModel} from "@/src/server/models/videoModel";
import connectDB from "@/src/server/database/connection";

export async function GET(request: NextRequest){
    const searchParams = request.nextUrl.searchParams;
    const videoID = searchParams.get("videoID");
    if(!videoID){
        return NextResponse.json({error: "Missing videoID parameter"}, {status: 400});
    }
    try{
        await connectDB();
        const videoData = await videoModel.findOne({videoID}).lean();
        if(!videoData){
            return NextResponse.json({error: "Video not found"}, {status: 404});
        }
        return NextResponse.json(videoData);
    }
    catch(e){
        console.error("Error fetching video data: ", e);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}