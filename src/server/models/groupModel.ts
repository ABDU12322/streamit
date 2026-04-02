import mongoose, { Schema } from "mongoose";

const groupSchema = new Schema({
    groupID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    createdBy: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    videoCount: { type: Number, default: 0 },
}, { timestamps: true });

export const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);
