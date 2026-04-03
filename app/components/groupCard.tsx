import Image from "next/image";
import { group } from "@/src/server/types/group";

export default function GroupCard({ group }: { group: group }) {
    return (
        <div className="group rounded-xl overflow-hidden h-full transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="bg-slate-800 rounded-xl border border-emerald-500/20 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden flex flex-col h-full">
                {/* Image Container */}
                <div className="relative w-full aspect-video bg-gradient-to-br from-emerald-600 to-emerald-800 overflow-hidden flex items-center justify-center">
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
                            <p className="text-white/50 text-xs">Collection</p>
                        </div>
                    )}
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors duration-300">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-20 h-20 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>

                    {/* Video Count Badge */}
                    <div className="absolute top-2 right-2 bg-emerald-600/90 backdrop-blur px-3 py-1 rounded-full shadow-lg">
                        <span className="text-white text-sm font-bold">{group.videoCount} videos</span>
                    </div>
                </div>

                {/* Content Container */}
                <div className="p-4 flex flex-col flex-grow bg-slate-800 border-t border-emerald-500/10">
                    <h2 className="text-base font-bold text-slate-100 line-clamp-2 mb-2 group-hover:text-emerald-300 transition-colors">
                        {group.name}
                    </h2>
                    <p className="text-sm text-slate-400 line-clamp-2 flex-grow mb-3">
                        {group.description || "No description"}
                    </p>
                    <div className="flex justify-between items-center text-xs pt-3 border-t border-emerald-500/10">
                        <span className="text-slate-400 font-medium">{group.createdBy}</span>
                        <span className="text-emerald-400 font-semibold">
                            {new Date(group.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
