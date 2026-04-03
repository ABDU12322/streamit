"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { group } from "@/src/server/types/group";
import { getCurrentUserFromCookies } from "@/src/client/utils/cookies";

export default function UploadVideo() {
    const router = useRouter();
    const [videoName, setVideoName] = useState("No video selected");
    const [thumbnailName, setThumbnailName] = useState("No thumbnail selected");
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [currentUser, setCurrentUser] = useState<string>("");
    const [userGroups, setUserGroups] = useState<group[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState("");

    useEffect(() => {
        const user = getCurrentUserFromCookies();
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await fetch("/api/groups");
            const data = await response.json();
            if (data.groups) {
                // Filter groups owned by current user
                if (currentUser) {
                    const filtered = data.groups.filter((grp: group) => grp.createdBy === currentUser);
                    setUserGroups(filtered);
                }
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchGroups();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setUploadProgress(0);
        setProgressMessage("Preparing upload...");

        try {
            const formData = new FormData(e.currentTarget);
            if (selectedGroup) {
                formData.append("groupId", selectedGroup);
                console.log("Selected group ID:", selectedGroup);
            }

            // Simulate chunking progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + Math.random() * 20;
                });
            }, 500);

            setProgressMessage("Uploading and processing video...");
            
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            clearInterval(progressInterval);
            setUploadProgress(95);
            setProgressMessage("Finalizing upload...");

            const data = await response.json();

            if (!response.ok) {
                setProgressMessage(`Error: ${data.error || "Upload failed"}`);
                setIsLoading(false);
                setUploadProgress(0);
                return;
            }

            setUploadProgress(100);
            setProgressMessage("Upload complete! Redirecting to dashboard...");
            
            // Delay redirect to show completion message
            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);
        } catch (error) {
            console.error("Upload error:", error);
            setProgressMessage("Error: Failed to upload video. Please try again.");
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
            />

            <section className="relative mx-auto grid w-full max-w-2xl gap-8">

                <article className="bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-300 shadow-lg hover:shadow-xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/10">
                    <h2 className="text-2xl font-bold text-emerald-400">Upload Video</h2>
                    <p className="mt-2 text-sm text-slate-400">Fill in the details below to publish your video.</p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label htmlFor="video-group" className="mb-2 block text-sm font-semibold text-emerald-400">
                                Show (Optional)
                            </label>
                            <select
                                name="groupId"
                                id="video-group"
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800 border-2 border-emerald-500/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-200 hover:border-emerald-400/50"
                                disabled={!currentUser || isLoading}
                            >
                                <option value="">No Show (Solo Video)</option>
                                {userGroups.map((grp) => (
                                    <option key={grp.groupID} value={grp.groupID}>
                                        {grp.name}
                                    </option>
                                ))}
                            </select>
                            {currentUser && userGroups.length === 0 && (
                                <p className="mt-1 text-xs text-emerald-400/70">You haven&apos;t created any shows yet.</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="video-title" className="mb-2 block text-sm font-semibold text-emerald-400">
                                Video Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                id="video-title"
                                placeholder="Example: Building Streamit in 10 minutes"
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-3 bg-slate-800 border-2 border-emerald-500/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-200 hover:border-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label htmlFor="video-description" className="mb-2 block text-sm font-semibold text-emerald-400">
                                Description
                            </label>
                            <textarea
                                name="description"
                                id="video-description"
                                placeholder="Describe what your audience will learn in this video."
                                required
                                rows={4}
                                disabled={isLoading}
                                className="w-full px-4 py-3 bg-slate-800 border-2 border-emerald-500/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-200 resize-none hover:border-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="video-file" className="block text-sm font-semibold text-emerald-400">
                                Video File
                            </label>
                            <label
                                htmlFor="video-file"
                                className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 border-dashed border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 px-4 py-4 transition ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-emerald-500 hover:from-emerald-500/10 hover:to-emerald-600/10"}`}
                            >
                                <span className="truncate text-sm text-slate-300">{videoName}</span>
                                <span className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-3 py-2 text-xs font-semibold text-white shadow-lg">
                                    Choose File
                                </span>
                            </label>
                            <input
                                id="video-file"
                                type="file"
                                name="video"
                                accept="video/*"
                                required
                                disabled={isLoading}
                                onChange={(event) => setVideoName(event.target.files?.[0]?.name ?? "No video selected")}
                                className="sr-only"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="thumbnail-file" className="block text-sm font-semibold text-emerald-400">
                                Thumbnail File
                            </label>
                            <label
                                htmlFor="thumbnail-file"
                                className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 border-dashed border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 px-4 py-4 transition ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-emerald-500 hover:from-emerald-500/10 hover:to-emerald-600/10"}`}
                            >
                                <span className="truncate text-sm text-slate-300">{thumbnailName}</span>
                                <span className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-3 py-2 text-xs font-semibold text-white shadow-lg">
                                    Choose File
                                </span>
                            </label>
                            <input
                                id="thumbnail-file"
                                type="file"
                                name="thumbnail"
                                accept="image/*"
                                required
                                disabled={isLoading}
                                onChange={(event) =>
                                    setThumbnailName(event.target.files?.[0]?.name ?? "No thumbnail selected")
                                }
                                className="sr-only"
                            />
                        </div>

                        {/* Progress Section */}
                        {isLoading && (
                            <div className="rounded-xl bg-gradient-to-r from-emerald-500/15 to-emerald-600/15 border-2 border-emerald-500/40 p-5">
                                <div className="mb-3">
                                    <p className="text-sm font-semibold text-emerald-400 mb-3">{progressMessage}</p>
                                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-emerald-500/30">
                                        <div
                                            className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/50"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-emerald-400 mt-3 font-semibold">{Math.round(uploadProgress)}% Complete</p>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-lg font-bold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-emerald-500/50"
                        >
                            {isLoading ? "Uploading..." : "Upload Video"}
                        </button>
                    </form>
                </article>
            </section>
        </main>
    );
}