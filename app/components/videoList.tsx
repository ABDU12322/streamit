import Image from "next/image";
import { video } from "@/src/server/types/video";

export default function VideoList({ video }: { video: video }){
    return(
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col h-full group">
            {/* Image Container - Takes majority of space */}
            <div className="relative w-full aspect-video bg-gray-700 overflow-hidden">
                <Image 
                    src={video.thumbnailPath} 
                    alt={video.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    priority={false}
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-20 h-20 text-red-600 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-4 flex flex-col flex-grow bg-gradient-to-b from-gray-800 to-gray-900">
                <h2 className="text-base font-bold text-white line-clamp-2 mb-2 group-hover:text-red-500 transition-colors">
                    {video.title}
                </h2>
                <p className="text-sm text-gray-400 line-clamp-2 flex-grow mb-3">
                    {video.description}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-700">
                    <span className="text-gray-400">{video.uploader}</span>
                    <span className="text-red-500 font-semibold">{video.views} views</span>
                </div>
            </div>
        </div>
    );
}