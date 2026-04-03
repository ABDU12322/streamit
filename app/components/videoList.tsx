import Image from "next/image";
import { video } from "@/src/server/types/video";

export default function VideoList({ video }: { video: video }){
    return(
        <div className="group rounded-xl overflow-hidden h-full transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="bg-slate-800 rounded-xl border border-emerald-500/20 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden h-full flex flex-col">
                {/* Image Container - Takes majority of space */}
                <div className="relative w-full aspect-video bg-gradient-to-br from-emerald-600 to-emerald-800 overflow-hidden">
                    <Image 
                        src={video.thumbnailPath} 
                        alt={video.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        priority={false}
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors duration-300">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-20 h-20 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                    {/* Duration Badge */}
                    <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur px-2 py-1 rounded-lg">
                        <span className="text-white text-xs font-semibold">HD</span>
                    </div>
                </div>

                {/* Content Container */}
                <div className="p-4 flex flex-col flex-grow bg-slate-800 border-t border-emerald-500/10">
                    <h2 className="text-base font-bold text-slate-100 line-clamp-2 mb-2 group-hover:text-emerald-300 transition-colors">
                        {video.title}
                    </h2>
                    <p className="text-sm text-slate-400 line-clamp-2 flex-grow mb-3">
                        {video.description}
                    </p>
                    <div className="flex justify-between items-center text-xs pt-3 border-t border-emerald-500/10">
                        <span className="text-slate-400 font-medium">{video.uploader}</span>
                        <span className="text-emerald-400 font-bold">{video.views} views</span>
                    </div>
                </div>
            </div>
        </div>
    );
}