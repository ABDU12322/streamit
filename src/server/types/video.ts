export interface Video {
    videoID: string;
    title: string;
    description: string;
    hlsURL: string;
    thumbnailPath: string;
    uploadDate: Date;
    duration: number;
    uploader: string;
    views: number;
}

// Backwards compatibility
export type video = Video;