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
        <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#f4f8ff_0%,_#ffffff_55%),radial-gradient(circle_at_bottom_right,_#fff6e8_0%,_transparent_40%)] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl"
            />

            <section className="relative mx-auto grid w-full max-w-6xl gap-8">

                <article className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_16px_55px_-35px_rgba(15,23,42,0.7)] sm:p-8">
                    <h2 className="text-xl font-semibold">Upload Details</h2>
                    <p className="mt-1 text-sm text-slate-500">Fill in the fields below to publish.</p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label htmlFor="video-group" className="mb-2 block text-sm font-medium text-slate-700">
                                Show (Optional)
                            </label>
                            <select
                                name="groupId"
                                id="video-group"
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                <p className="mt-1 text-xs text-slate-500">You haven&apos;t created any shows yet.</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="video-title" className="mb-2 block text-sm font-medium text-slate-700">
                                Video Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                id="video-title"
                                placeholder="Example: Building Streamit in 10 minutes"
                                required
                                disabled={isLoading}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label htmlFor="video-description" className="mb-2 block text-sm font-medium text-slate-700">
                                Description
                            </label>
                            <textarea
                                name="description"
                                id="video-description"
                                placeholder="Describe what your audience will learn in this video."
                                required
                                rows={4}
                                disabled={isLoading}
                                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="video-file" className="block text-sm font-medium text-slate-700">
                                Video File
                            </label>
                            <label
                                htmlFor="video-file"
                                className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-cyan-500 hover:bg-cyan-50"}`}
                            >
                                <span className="truncate text-sm text-slate-600">{videoName}</span>
                                <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
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
                            <label htmlFor="thumbnail-file" className="block text-sm font-medium text-slate-700">
                                Thumbnail File
                            </label>
                            <label
                                htmlFor="thumbnail-file"
                                className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-amber-500 hover:bg-amber-50"}`}
                            >
                                <span className="truncate text-sm text-slate-600">{thumbnailName}</span>
                                <span className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white">
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
                            <div className="rounded-xl bg-blue-50 p-4 border border-blue-200">
                                <div className="mb-3">
                                    <p className="text-sm font-semibold text-blue-900 mb-2">{progressMessage}</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-blue-700 mt-2">{Math.round(uploadProgress)}%</p>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {isLoading ? "Uploading..." : "Upload Video"}
                        </button>
                    </form>
                </article>
            </section>
        </main>
    );
}