import { NextRequest, NextResponse } from "next/server";
import storeVideo from "@/src/server/database/storeVideo";
import { connectDB } from "@/src/server/database/connection";
import { Group } from "@/src/server/models/groupModel";
import { requireAuth } from "@/src/server/utils/auth";
import { v4 as uuidv4} from "uuid";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const auth = requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        const currentUser = auth.user?.username;

        // Parse the FormData from request
        const formData = await request.formData();

        // Extract fields from FormData
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const videoFile = formData.get("video") as File;
        const thumbnailFile = formData.get("thumbnail") as File;
        const groupId = formData.get("groupId") as string | null;

        // Validation: Check all required fields are present
        if (!title || !title.trim()) {
            return NextResponse.json(
                { error: "Video title is required" },
                { status: 400 }
            );
        }

        if (!description || !description.trim()) {
            return NextResponse.json(
                { error: "Video description is required" },
                { status: 400 }
            );
        }

        if (!videoFile) {
            return NextResponse.json(
                { error: "Video file is required" },
                { status: 400 }
            );
        }

        if (!thumbnailFile) {
            return NextResponse.json(
                { error: "Thumbnail file is required" },
                { status: 400 }
            );
        }

        // Validate file types
        const videoMimeType = videoFile.type;
        const thumbnailMimeType = thumbnailFile.type;

        const validVideoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
        const validImageTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!validVideoTypes.includes(videoMimeType)) {
            return NextResponse.json(
                {
                    error: "Invalid video format. Accepted: MP4, MOV, AVI",
                },
                { status: 400 }
            );
        }

        if (!validImageTypes.includes(thumbnailMimeType)) {
            return NextResponse.json(
                {
                    error: "Invalid thumbnail format. Accepted: JPG, PNG, WebP",
                },
                { status: 400 }
            );
        }

        // Validate group ownership if groupId is provided
        if (groupId) {
            try {
                await connectDB();
                const group = await Group.findOne({ groupID: groupId });

                if (!group) {
                    return NextResponse.json(
                        { error: "Group not found" },
                        { status: 404 }
                    );
                }

                if (group.createdBy !== currentUser) {
                    return NextResponse.json(
                        { error: "You can only upload to your own shows" },
                        { status: 403 }
                    );
                }
            } catch (error) {
                console.error("Error validating group ownership:", error);
                return NextResponse.json(
                    { error: "Failed to validate group" },
                    { status: 500 }
                );
            }
        }
        const videoBuffer = await videoFile.arrayBuffer();
        const videoFileData = {
            buffer: new Uint8Array(videoBuffer),
            originalname: videoFile.name,
            mimetype: videoFile.type,
        };

        // Save thumbnail locally and get path
        const thumbnailDir = path.join(process.cwd(), "public", "thumbnails");
        if (!fs.existsSync(thumbnailDir)) {
            fs.mkdirSync(thumbnailDir, { recursive: true });
        }

        const thumbnailExtension = thumbnailFile.name.split(".").pop() || "jpg";
        const thumbnailFilename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${thumbnailExtension}`;
        const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
        const thumbnailBuffer = await thumbnailFile.arrayBuffer();
        fs.writeFileSync(thumbnailPath, Buffer.from(thumbnailBuffer));
        console.log("groupid: ", groupId);
        // Prepare video metadata
        const videoData = {
            videoID: uuidv4(),
            title: title.trim(),
            description: description.trim(),
            hlsURL: "", // Will be set by storeVideo
            thumbnailPath: `/thumbnails/${thumbnailFilename}`,
            uploadDate: new Date(),
            duration: 0, // You can extract this from ffmpeg if needed
            uploader: currentUser || "user",
            views: 0,
            groupId: groupId
        };

        // Call storeVideo service to process and store
        const result = await storeVideo(
            videoData,
            `/thumbnails/${thumbnailFilename}`,
            videoFileData
        );

        // Increment videoCount in the group document if groupId is provided
        if (groupId) {
            await Group.updateOne(
                { groupID: groupId },
                { $inc: { videoCount: 1 } }
            );
        }

        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: "Video uploaded successfully",
                data: {
                    videoId: result.videoID,
                    title: result.title,
                    hlsURL: result.hlsURL,
                    thumbnailPath: result.thumbnailPath,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            {
                error: "Failed to upload video",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// Optional: Add GET handler to verify endpoint exists
export async function GET() {
    return NextResponse.json(
        { message: "Upload API endpoint (POST only)" },
        { status: 405 }
    );
}
