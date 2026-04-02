import connectDB from "./connection";
import { Video } from "../models/videoModel";
import { video } from "../types/video";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { createClient } from "@supabase/supabase-js";
import os from "os";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    let tempDir: string | null = null;
    
    try {
        // Ensure database connection
        await connectDB();
        
        // Create temporary directory for HLS processing
        tempDir = path.join(os.tmpdir(), `video_${videoData.videoID}`);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Save original video temporarily
        const rawVideoPath = path.join(tempDir, `original_${videoData.videoID}.mp4`);
        fs.writeFileSync(rawVideoPath, videoFile.buffer);

        // Create HLS master playlist path
        const masterPlaylistPath = path.join(tempDir, "master.m3u8");

        // Convert video to HLS format using fluent-ffmpeg
        await new Promise<void>((resolve, reject) => {
            ffmpeg(rawVideoPath)
                .outputOptions([
                    "-c:v libx264",
                    "-c:a aac",
                    "-f hls",
                    "-hls_time 10",
                    "-hls_list_size 0",
                    `-hls_segment_filename ${path.join(tempDir as string, "segment_%03d.ts")}`
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

        // Upload HLS files to Supabase (skip original video file)
        const hlsFiles = fs.readdirSync(tempDir);
        const bucketPath = `videos/${videoData.videoID}`;

        for (const file of hlsFiles) {
            // Skip the original video file - only upload HLS segments and master playlist
            if (file.startsWith("original_")) {
                continue;
            }

            const filePath = path.join(tempDir, file);
            const fileBuffer = fs.readFileSync(filePath);
            const contentType = file.endsWith(".m3u8") ? "application/vnd.apple.mpegurl" : "video/mp2t";

            const { error: uploadError } = await supabase.storage
                .from("videos")
                .upload(`${bucketPath}/${file}`, fileBuffer, {
                    contentType,
                    upsert: true
                });

            if (uploadError) {
                console.error(`Error uploading ${file}:`, uploadError);
                throw uploadError;
            }

            console.log(`Uploaded ${file} to Supabase`);
        }

        // Get public URL for the master.m3u8 file
        const { data } = supabase.storage
            .from("videos")
            .getPublicUrl(`${bucketPath}/master.m3u8`);

        const hlsURL = data.publicUrl;

        // Create and store video in database
        const storedVideo = await Video.create({
            videoID: videoData.videoID,
            title: videoData.title,
            description: videoData.description,
            hlsURL: hlsURL,
            thumbnailPath: thumbnailPath,
            uploadDate: videoData.uploadDate,
            duration: videoData.duration,
            uploader: videoData.uploader,
            views: videoData.views || 0,
            groupId: videoData.groupId || null,
        });

        console.log("Video stored successfully:", storedVideo._id);
        return storedVideo;
    } catch (error) {
        console.error("Error storing video:", error);
        throw error;
    } finally {
        // Clean up temporary directory
        if (tempDir && fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            console.log("Temporary directory cleaned up");
        }
    }
}

export default storeVideo;