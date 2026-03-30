import connectDB from "./connection";
import { Video } from "../models/videoModel";
import { video } from "../types/video";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";

// Manually set the ffmpeg path
const ffmpegPath = path.join(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg.exe");

console.log("FFmpeg path:", ffmpegPath);
console.log("FFmpeg exists:", fs.existsSync(ffmpegPath));

if (fs.existsSync(ffmpegPath)) {
    ffmpeg.setFfmpegPath(ffmpegPath);
} else {
    console.error("FFmpeg not found at:", ffmpegPath);
}

interface FFmpegProgress {
    percent?: number;
    frames?: number;
    currentFps?: number;
    currentKbps?: number;
    targetSize?: number;
    timemark?: string;
}

async function storeVideo(
    videoData: video,
    thumbnailPath: string,
    videoFile: { buffer: Uint8Array; originalname?: string; mimetype?: string }
) {
    try {
        // Ensure database connection
        await connectDB();
        
        // Use public folder for video storage (accessible via URL /videos/)
        const videoStorageDir = path.join(process.cwd(), "public", "videos");
        const videoPath = path.join(videoStorageDir, videoData.videoID);

        // Create video-specific directory if it doesn't exist
        if (!fs.existsSync(videoPath)) {
            fs.mkdirSync(videoPath, { recursive: true });
        }

        // Save original video with unique name under its own folder
        const rawVideoPath = path.join(videoPath, `original_${videoData.videoID}.mp4`);
        fs.writeFileSync(rawVideoPath, videoFile.buffer);

        // Create HLS master playlist path
        const masterPlaylistPath = path.join(videoPath, "master.m3u8");

        // Convert video to HLS format using fluent-ffmpeg
        await new Promise<void>((resolve, reject) => {
            ffmpeg(rawVideoPath)
                .outputOptions([
                    "-c:v libx264",
                    "-c:a aac",
                    "-f hls",
                    "-hls_time 10",
                    "-hls_list_size 0",
                    `-hls_segment_filename ${videoPath}/segment_%03d.ts`
                ])
                .output(masterPlaylistPath)
                .on("start", (command: string) => {
                    console.log("FFmpeg command:", command);
                })
                .on("progress", (progress: FFmpegProgress) => {
                    console.log(`FFmpeg progress: ${progress.percent || 0}% done`);
                })
                .on("end", () => {
                    console.log("HLS conversion completed successfully");
                    resolve();
                })
                .on("error", (error: Error) => {
                    console.error("FFmpeg error:", error.message);
                    reject(new Error(`Video conversion failed: ${error.message}`));
                })
                .run();
        });

        // Create and store video in database
        const storedVideo = await Video.create({
            videoID: videoData.videoID,
            title: videoData.title,
            description: videoData.description,
            hlsURL: `/videos/${videoData.videoID}/master.m3u8`,
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