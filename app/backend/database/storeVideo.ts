import connectDB from "./connection";
import { Video } from "../models/videoModel";
import { video } from "../types/video";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
async function storeVideo(videoData: video, thumbnailPath: string, videoFile: { buffer: Uint8Array; originalname?: string; mimetype?: string }) {
    try {
        // Ensure database connection
        await connectDB();

        const videoId = uuidv4();
        const videoDir = path.join(__dirname, "../videos");
        const videoPath = path.join(videoDir, `${videoId}`);

        // Create video directory if it doesn't exist
        if (!fs.existsSync(videoDir)) {
            fs.mkdirSync(videoDir, { recursive: true });
        }
        const rawVideoPath = path.join(videoDir, "original.mp4");
        fs.writeFileSync(rawVideoPath, videoFile.buffer);

        const masterPlaylistPath = path.join(videoPath, " master.m3u8");
        const ffmpegCommand = `ffmpeg -i ${rawVideoPath} -c:v libx264 -c:a aac -f hls -hls_time 10 -hls_list_size 0 -hls_segment_filename "${videoPath}/segment_%03d.ts" ${masterPlaylistPath}`;

        await execAsync(ffmpegCommand);
        
        // Create and store video in database
        const storedVideo = await Video.create({
            videoID: videoId,
            title: videoData.title,
            description: videoData.description,
            hlsURL: `/videos/${videoId}/master.m3u8`,
            thumbnailPath: thumbnailPath,
            uploadDate: videoData.uploadDate,
            duration: videoData.duration,
            uploader: videoData.uploader,
            views: videoData.views || 0,
        });
        
        console.log("Video stored successfully:", storedVideo._id);
        return storedVideo;
    } catch (error) {
        console.error("Error storing video:", error);
        throw error;
    }
}

export default storeVideo;