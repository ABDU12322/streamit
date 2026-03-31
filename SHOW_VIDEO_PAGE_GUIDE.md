# Show-Video Page Frontend Implementation Guide

## Overview
The `show-video/page.tsx` needs to integrate the HLS streaming player with video metadata fetching and UI display.

---

## What to Add to page.tsx

### 1. **Extract Video ID from URL Search Params**
```typescript
import { useSearchParams } from "next/navigation";

const searchParams = useSearchParams();
const videoID = searchParams.get("id");
```
**Why:** The video ID is passed via URL query parameter (e.g., `/show-video?id=123abc`). This ID is needed to fetch video metadata from MongoDB.

---

### 2. **Fetch Video Metadata from API**
```typescript
useEffect(() => {
    if (!videoID) return;
    
    const fetchVideo = async () => {
        try {
            const response = await fetch(`/api/show-video?id=${videoID}`);
            const data = await response.json();
            setVideoData(data);
            setVideoURL(data.hlsURL); // Set the HLS manifest URL
        } catch (error) {
            console.error("Failed to fetch video:", error);
        }
    };
    
    fetchVideo();
}, [videoID]);
```
**Why:** 
- Fetches video metadata from MongoDB via `/api/show-video?id={videoID}`
- Gets `hlsURL` (path to .m3u8 manifest file)
- Returns video info: title, duration, views, uploader, description

---

### 3. **Create Video Element Reference**
```typescript
import { useRef } from "react";

const videoRef = useRef<HTMLVideoElement>(null);
```
**Why:** Needed to pass the actual video DOM element to HLS.js for attachment.

---

### 4. **Initialize HLS Player**
```typescript
import { initializeHLSPlayer } from "@/app/utils/hlsPlayer";

useEffect(() => {
    if (videoRef.current && videoURL) {
        initializeHLSPlayer(videoRef.current, videoURL);
    }
}, [videoURL]);
```
**Why:** 
- Calls the HLS utility function to init HLS.js
- Attaches HLS to video element
- Starts loading manifest and segments
- Triggers event handlers for streaming status

---

### 5. **Update Video Element in JSX**
```typescript
<video 
    ref={videoRef}
    className="mx-auto w-full h-auto max-w-3xl"
    controls
>
</video>
```
**Why:**
- Connect the ref to the actual video element
- `controls` attribute adds play/pause/volume/fullscreen buttons
- No `src` attribute needed - HLS.js manages the source

---

### 6. **Display Video Metadata**
```typescript
{videoData && (
    <div className="mt-4 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">{videoData.title}</h1>
        <p className="text-gray-600 mt-2">{videoData.description}</p>
        <div className="flex gap-4 mt-3 text-sm text-gray-500">
            <span>📅 {new Date(videoData.uploadDate).toLocaleDateString()}</span>
            <span>👁️ {videoData.views} views</span>
            <span>⏱️ {videoData.duration}s</span>
            <span>👤 {videoData.uploader}</span>
        </div>
    </div>
)}
```
**Why:** Displays video information fetched from the API below the player.

---

### 7. **Display Streaming Status (Optional but Recommended)**
```typescript
const [isBuffering, setIsBuffering] = useState(false);
const [currentSegment, setCurrentSegment] = useState<number | null>(null);
const [currentQuality, setCurrentQuality] = useState("auto");

{isBuffering && <div className="text-yellow-500">📥 Buffering...</div>}
{currentSegment !== null && <div>Playing segment: {currentSegment}</div>}
{currentQuality && <div>Quality: {currentQuality}</div>}
```
**Why:** Shows real-time streaming state to users. You can update these states in the event handlers in `hlsPlayer.ts`.

---

## Complete Minimal Implementation

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Video } from "@/src/server/types/video";
import { initializeHLSPlayer } from "@/app/utils/hlsPlayer";

export default function ShowVideoPage() {
    const searchParams = useSearchParams();
    const videoID = searchParams.get("id");
    
    const videoRef = useRef<HTMLVideoElement>(null);
    
    const [videoURL, setVideoURL] = useState("");
    const [videoData, setVideoData] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch video metadata
    useEffect(() => {
        if (!videoID) {
            setError("No video ID provided");
            return;
        }

        const fetchVideo = async () => {
            try {
                const response = await fetch(`/api/show-video?id=${videoID}`);
                if (!response.ok) throw new Error("Failed to fetch video");
                
                const data = await response.json();
                setVideoData(data);
                setVideoURL(data.hlsURL);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error loading video");
                setLoading(false);
            }
        };

        fetchVideo();
    }, [videoID]);

    // Initialize HLS player
    useEffect(() => {
        if (videoRef.current && videoURL) {
            initializeHLSPlayer(videoRef.current, videoURL);
        }
    }, [videoURL]);

    if (loading) return <div className="p-8">Loading video...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="p-8">
            {/* Video Player */}
            <div className="max-w-3xl mx-auto">
                <video 
                    ref={videoRef}
                    className="w-full h-auto rounded-lg bg-black"
                    controls
                />
            </div>

            {/* Video Metadata */}
            {videoData && (
                <div className="mt-6 max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">{videoData.title}</h1>
                    <p className="text-gray-600 mb-4">{videoData.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t pt-4">
                        <span>📅 {new Date(videoData.uploadDate).toLocaleDateString()}</span>
                        <span>👁️ {videoData.views} views</span>
                        <span>⏱️ {Math.floor(videoData.duration / 60)}:{String(Math.floor(videoData.duration % 60)).padStart(2, '0')} </span>
                        <span>👤 Uploaded by {videoData.uploader}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
```

---

## Data Flow Summary

```
1. User visits: /show-video?id=abc123
   ↓
2. useSearchParams() extracts id=abc123
   ↓
3. useEffect calls /api/show-video?id=abc123
   ↓
4. API queries MongoDB, returns videoData + hlsURL
   ↓
5. setVideoURL(hlsURL) triggers another useEffect
   ↓
6. initializeHLSPlayer() is called with video element + hlsURL
   ↓
7. HLS.js loads manifest (.m3u8), attaches to video element
   ↓
8. Browser plays video using native HTML5 video player
   ↓
9. HLS.js auto-fetches segments, handles quality adaptation
   ↓
10. UI displays metadata and video with controls
```

---

## Key Points

| What | Why | Where |
|------|-----|-------|
| `useSearchParams()` | Extract videoID from URL | Next.js hook |
| `/api/show-video?id=X` | Fetch metadata from MongoDB | API route |
| `useRef` for video | pass DOM element to HLS.js | React hook |
| `initializeHLSPlayer()` | Setup HLS streaming | hlsPlayer.ts |
| No `src` on video tag | HLS.js manages source dynamically | Video element |
| `controls` attribute | Show play/pause/volume/fullscreen | HTML5 video |

---

## Error Handling to Consider

- Missing video ID in URL
- Video not found in database (404)
- Network error fetching metadata
- HLS.js errors (manifest not found, segment failures)
- Browser doesn't support video playback

All of these should show appropriate error messages to the user.
