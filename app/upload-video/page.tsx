"use client";

import { useState } from "react";

export default function UploadVideo() {
    const [videoName, setVideoName] = useState("No video selected");
    const [thumbnailName, setThumbnailName] = useState("No thumbnail selected");

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

            <section className="relative mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr_1fr]">
                <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-[0_14px_45px_-30px_rgba(15,23,42,0.55)] backdrop-blur-sm sm:p-10">
                    <p className="mb-4 inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                        Streamit Studio
                    </p>
                    <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                        Upload Your Next Video
                    </h1>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                        Publish with a clean workflow: add title and description, attach your media,
                        and submit in one place. We format files and prepare the stream in the
                        background.
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Video Format
                            </p>
                            <p className="mt-2 text-lg font-semibold">MP4 / MOV</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Max Size
                            </p>
                            <p className="mt-2 text-lg font-semibold">2 GB</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Thumbnail
                            </p>
                            <p className="mt-2 text-lg font-semibold">JPG / PNG</p>
                        </div>
                    </div>
                </article>

                <article className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_16px_55px_-35px_rgba(15,23,42,0.7)] sm:p-8">
                    <h2 className="text-xl font-semibold">Upload Details</h2>
                    <p className="mt-1 text-sm text-slate-500">Fill in the fields below to publish.</p>

                    <form action="/api/upload" method="post" encType="multipart/form-data" className="mt-6 space-y-5">
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
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
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
                                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="video-file" className="block text-sm font-medium text-slate-700">
                                Video File
                            </label>
                            <label
                                htmlFor="video-file"
                                className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition hover:border-cyan-500 hover:bg-cyan-50"
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
                                className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition hover:border-amber-500 hover:bg-amber-50"
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
                                onChange={(event) =>
                                    setThumbnailName(event.target.files?.[0]?.name ?? "No thumbnail selected")
                                }
                                className="sr-only"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-300"
                        >
                            Upload Video
                        </button>
                    </form>
                </article>
            </section>
        </main>
    );
}