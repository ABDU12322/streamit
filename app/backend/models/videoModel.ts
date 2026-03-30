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

// Create model directly - Mongoose doesn't require active connection
export const Video = mongoose.model("Video", videoSchema);