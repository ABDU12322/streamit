"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/app/components/navbar";
import VideoList from "@/app/components/videoList";
import { video } from "@/src/server/types/video";

export default function Dashboard(){
    const [videos, setVideos] = useState<video[]>([]);
    useEffect(()=>{
        fetch("/api/dashboard")
        .then((res)=>res.json())
        .then((data)=>{
            if(data.error){
                console.error("API Error fetching Videos", data.error);
            }
            else{
                setVideos(data.videos);
            }
        })
    }, [])
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
            <Navbar />
            
            {/* Search Section */}
            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-gray-900 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-6">Find Your Videos</h2>
                    <form action="/api/dashboard" method="post" className="flex gap-3 flex-wrap">
                        <input 
                            className="flex-1 min-w-max rounded-full bg-white text-black px-6 py-3 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300" 
                            type="text" 
                            name="search" 
                            id="search" 
                            placeholder="Search videos by name or description..."
                        />
                        <input 
                            className="rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 cursor-pointer transition duration-300 transform hover:scale-105" 
                            type="submit" 
                            value="Search" 
                        />
                    </form>
                </div>
            </div>

            {/* Videos Section */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {videos.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-xl">No videos found. Start uploading!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {videos.map((video)=>{
                            return (
                                <div key={video.videoID} className="group cursor-pointer">
                                    <VideoList video={video}/>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}