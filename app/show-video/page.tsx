"use client";

import { useState, useEffect, useRef } from "react";
import { Video } from "@/src/server/types/video";
import { initializeHLSPlayer } from "../utils/hlsPlayer";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/navbar";

export default function ShowVideoPage() {
    const searchParamsObj = useSearchParams();
    const videoIDFromURL = searchParamsObj.get("videoID");
    const videoRef = useRef<HTMLVideoElement>(null);
    const viewsIncrementedRef = useRef(false);

    const [videoURL, setVideoURL] = useState("");
    const [videoData, setVideoData] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isBuffering, setIsBuffering] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [currentQuality, setCurrentQuality] = useState("auto");

    useEffect(() => {
        if (!videoIDFromURL) {
            setError("No video ID provided in URL");
            setLoading(false);
            return;
        }

        const fetchVideoData = async () => {
            try {
                const response = await fetch(`/api/show-video?videoID=${videoIDFromURL}`);
                if (!response.ok) throw new Error("Video not found");

                const data = await response.json();
                setVideoData(data);
                setVideoURL(data.hlsURL);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching video:", err);
                setError(err instanceof Error ? err.message : "Error loading video");
                setLoading(false);
            }
        };

        fetchVideoData();
    }, [videoIDFromURL]);

    useEffect(() => {
        if (videoRef.current && videoURL) {
            initializeHLSPlayer(videoRef.current, videoURL);
            
            // Increment views when video starts playing
            const handlePlay = async () => {
                if (!viewsIncrementedRef.current && videoIDFromURL) {
                    viewsIncrementedRef.current = true;
                    try {
                        const response = await fetch(`/api/show-video?videoID=${videoIDFromURL}`, {
                            method: 'PUT'
                        });
                        const data = await response.json();
                        if (data.success) {
                            // Update videoData with new views count
                            setVideoData(prev => prev ? {
                                ...prev,
                                views: data.views
                            } : null);
                        }
                    } catch (err) {
                        console.error("Error incrementing views:", err);
                    }
                }
            };

            const videoElement = videoRef.current;
            videoElement?.addEventListener('play', handlePlay, { once: true });
            
            return () => {
                videoElement?.removeEventListener('play', handlePlay);
            };
        }
    }, [videoURL, videoIDFromURL]);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        }
        return `${minutes}:${String(secs).padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
            <Navbar />

            {/* Error State */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-red-500/20 border border-red-500 text-red-300 px-6 py-4 rounded-lg">
                        <p className="font-semibold">Error: {error}</p>
                        <p className="text-sm text-red-200 mt-2">
                            Make sure the video exists and the URL has a valid videoID parameter.
                        </p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && !error && (
                <div className="max-w-7xl mx-auto px-4 py-20">
                    <div className="text-center">
                        <div className="inline-block">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                        </div>
                        <p className="text-gray-400 mt-4 text-lg">Loading video...</p>
                    </div>
                </div>
            )}

            {/* Video Player Section */}
            {videoURL && (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Video Player Container - Fixed 16:9 Aspect Ratio */}
                    <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 group aspect-video">
                        <video
                            ref={videoRef}
                            className="w-full h-full bg-black object-contain object-center"
                            controls
                            controlsList="nodownload"
                        />

                        {/* Buffering Indicator */}
                        {isBuffering && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full backdrop-blur">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span className="text-yellow-500 text-xs font-semibold">Buffering</span>
                            </div>
                        )}

                        {/* Quality Badge */}
                        {currentQuality !== "auto" && (
                            <div className="absolute top-4 left-4 bg-emerald-600/90 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur">
                                {currentQuality}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Video Metadata Section */}
            {videoData && (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Title */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">{videoData.title}</h1>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-gray-700">
                            {/* Views */}
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-emerald-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path
                                        fillRule="evenodd"
                                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-gray-300">
                                    <span className="font-semibold text-white">{videoData.views.toLocaleString()}</span> views
                                </span>
                            </div>

                            {/* Duration */}
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-emerald-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-gray-300">{formatDuration(videoData.duration)}</span>
                            </div>

                            {/* Upload Date */}
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-emerald-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h12a1 1 0 100-2H6z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-gray-300">{formatDate(videoData.uploadDate)}</span>
                            </div>
                        </div>

                        {/* Uploader */}
                        <div className="mt-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {videoData.uploader.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Uploaded by</p>
                                <p className="text-white font-semibold text-lg">{videoData.uploader}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur">
                        <h2 className="text-white font-semibold mb-3 text-lg">Description</h2>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {videoData.description || "No description provided."}
                        </p>
                    </div>

                    {/* Streaming Info */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Video ID Card */}
                        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 backdrop-blur">
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Video ID</p>
                            <p className="text-white font-mono text-sm mt-2 break-all">{videoData.videoID}</p>
                        </div>

                        {/* Format Card */}
                        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 backdrop-blur">
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Format</p>
                            <p className="text-emerald-500 font-semibold text-sm mt-2">HLS Streaming</p>
                        </div>

                        {/* Status Card */}
                        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 backdrop-blur">
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Status</p>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <p className="text-emerald-500 font-semibold text-sm">Ready</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Spacing */}
            <div className="pb-12"></div>
        </div>
    );
}