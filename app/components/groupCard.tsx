import Image from "next/image";
import { group } from "@/src/server/types/group";

export default function GroupCard({ group }: { group: group }) {
    return (
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col h-full group">
            {/* Image Container */}
            <div className="relative w-full aspect-video bg-gradient-to-br from-purple-600 to-blue-600 overflow-hidden flex items-center justify-center">
                {group.thumbnail ? (
                    <Image 
                        src={group.thumbnail} 
                        alt={group.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        priority={false}
                    />
                ) : (
                    <div className="text-center">
                        <svg className="w-16 h-16 text-white/70 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16m10-16v16m-6-8h.01M7 8h10M7 16h10" />
                        </svg>
                        <p className="text-white/50 text-xs">No thumbnail</p>
                    </div>
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-20 h-20 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>

                {/* Video Count Badge */}
                <div className="absolute top-3 right-3 bg-red-600 px-3 py-1 rounded-full">
                    <span className="text-white text-sm font-semibold">{group.videoCount} videos</span>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-4 flex flex-col flex-grow bg-gradient-to-b from-gray-800 to-gray-900">
                <h2 className="text-base font-bold text-white line-clamp-2 mb-2 group-hover:text-red-500 transition-colors">
                    {group.name}
                </h2>
                <p className="text-sm text-gray-400 line-clamp-2 flex-grow mb-3">
                    {group.description || "No description"}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-700">
                    <span className="text-gray-400">{group.createdBy}</span>
                    <span className="text-gray-500">
                        {new Date(group.createdDate).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
