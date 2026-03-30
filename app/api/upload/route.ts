import { NextRequest, NextResponse } from "next/server";
import storeVideo from "@/src/server/database/storeVideo";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        // Parse the FormData from request
        const formData = await request.formData();

        // Extract fields from FormData
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const videoFile = formData.get("video") as File;
        const thumbnailFile = formData.get("thumbnail") as File;

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

        // Convert video file to buffer
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

        // Prepare video metadata
        const videoData = {
            title: title.trim(),
            description: description.trim(),
            hlsURL: "", // Will be set by storeVideo
            thumbnailPath: `/thumbnails/${thumbnailFilename}`,
            uploadDate: new Date(),
            duration: 0, // You can extract this from ffmpeg if needed
            uploader: "user", // Replace with actual user from session/auth
            views: 0,
        };

        // Call storeVideo service to process and store
        const result = await storeVideo(
            videoData,
            `/thumbnails/${thumbnailFilename}`,
            videoFileData
        );

        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: "Video uploaded successfully",
                data: {
                    videoId: result._id,
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
