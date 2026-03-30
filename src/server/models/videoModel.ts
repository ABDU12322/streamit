import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema({
    videoID: {type: String, required: true, unique: true},
    title: { type: String, required: true },
    description: { type: String, required: true },
    hlsURL: { type: String, required: true },
    thumbnailPath: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    duration: { type: Number, required: true },
    uploader: { type: String, required: true },
    views: { type: Number, default: 0 },
}, { timestamps: true });

// Check if model already exists to prevent "Cannot overwrite model" error
export const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);