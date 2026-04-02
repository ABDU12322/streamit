"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/app/components/navbar";
import VideoList from "@/app/components/videoList";
import GroupCard from "@/app/components/groupCard";
import { video } from "@/src/server/types/video";
import { group } from "@/src/server/types/group";
import { getCurrentUserFromCookies } from "@/src/client/utils/cookies";

export default function Dashboard(){
    const [videos, setVideos] = useState<video[]>([]);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<string>("");
    const [userGroups, setUserGroups] = useState<group[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const user = getCurrentUserFromCookies();
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchDashboardData();
            
            // Set up polling to refresh videos every 10 seconds for real-time view updates
            const pollingInterval = setInterval(() => {
                fetchDashboardData();
            }, 10000);

            return () => clearInterval(pollingInterval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch("/api/dashboard");
            const data = await response.json();
            if (data.error) {
                console.error("API Error fetching dashboard data", data.error);
            } else {
                // Filter out videos that belong to a group
                const soloVideos = data.videos?.filter((video: video) => !video.groupId) || [];
                setVideos(soloVideos);

                // Filter groups owned by current user
                if (currentUser && data.groups) {
                    setUserGroups(data.groups);
                }
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        if (!currentUser) {
            alert("Please enter your username first");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    createdBy: currentUser,
                }),
            });

            if (response.ok) {
                setFormData({ name: "", description: "" });
                setShowCreateGroup(false);
                await fetchDashboardData();
            }
        } catch (error) {
            console.error("Error creating group:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSearching(true);
        const formData = new FormData(e.currentTarget);
        const searchQuery = formData.get("search") as string;

        if (!searchQuery.trim()) {
            setIsSearching(false);
            const response = await fetch("/api/dashboard");
            const data = await response.json();
            setVideos(data.videos);
            return;
        }

        try {
            const response = await fetch('/api/dashboard',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ search: searchQuery }),
            });
            const data = await response.json();

            if (data.error) {
                console.error("Error fetching search results:", data.error);
            } else {
                setVideos(data.videos);
            }
            setSearchQuery("");
        } catch (error) {
            console.error("Error performing search:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
            <Navbar />
            
            {/* Search Section */}
            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-gray-900 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-white">Find Your Content</h2>
                        {currentUser && <p className="text-blue-300 text-sm">Logged in as: <span className="font-semibold">{currentUser}</span></p>}
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <form onSubmit={handleSearch} className="flex gap-3 flex-grow">
                            <input 
                                className="flex-1 min-w-max rounded-full bg-white text-black px-6 py-3 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300" 
                                type="text" 
                                name="search" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                id="search" 
                                placeholder="Search videos by name or description..."
                            />
                            <button 
                                className="rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 cursor-pointer transition duration-300 transform hover:scale-105" 
                                type="submit"
                            >
                                Search
                            </button>
                        </form>
                        <button
                            onClick={() => setShowCreateGroup(!showCreateGroup)}
                            disabled={!currentUser}
                            className="rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold px-8 py-3 transition duration-300 transform hover:scale-105"
                        >
                            + Create Show
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Group Form */}
            {showCreateGroup && (
                <div className="bg-gray-800 mx-4 mt-4 p-6 rounded-lg max-w-6xl mx-auto mb-8">
                    <form onSubmit={handleCreateGroup} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Show Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                        <textarea
                            placeholder="Show Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            rows={3}
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition duration-300"
                            >
                                {loading ? "Creating..." : "Create Show"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreateGroup(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Groups/Shows Section */}
                {currentUser && userGroups && userGroups.length > 0 && !isSearching && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-6">My Shows</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {userGroups.map((grp) => (
                                <div key={grp.groupID} className="group cursor-pointer">
                                    <Link href={`/group/${grp.groupID}/videos`}>
                                        <GroupCard group={grp} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ungrouped Videos Section */}
                {videos && videos.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Solo Videos</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {videos
                                .filter((video) => !video.groupId) // Ensure only videos without a group are shown
                                .map((video) => {
                                    return (
                                        <div key={video.videoID} className="group cursor-pointer">
                                            <Link href={`/show-video?videoID=${video.videoID}`}>
                                                <VideoList video={video} />
                                            </Link>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!currentUser && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-xl">Please enter your username above to continue</p>
                    </div>
                )}
                {currentUser && userGroups.length === 0 && videos.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-xl">No shows or videos yet. Create your first show!</p>
                    </div>
                )}
            </div>
        </div>
    );
}