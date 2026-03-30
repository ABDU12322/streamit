import connectDB from "./connection";
import { Video } from "../models/videoModel";
import { video } from "../types/video";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import {exec} from "child_precess";
async function storeVideo(videoData: video, thumbnailPath: string, videoFile: Express.Multer.File) {
    try {
        // Ensure database connection
        await connectDB();

        const videoId = uuidv4();

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