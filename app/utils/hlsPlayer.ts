import Hls from "hls.js";

export function initializeHLSPlayer(videoElement: HTMLVideoElement, videoURL: string){
    if(Hls.isSupported()){
        const hls = new Hls();
        hls.on(Hls.Events.MANIFEST_PARSED, ()=>{
            videoElement.play().catch(error=>{
                console.error("Error playing video with HLS.js:", error);

            });

        })
        hls.on(Hls.Events.ERROR, (event, data)=>{
            if(data.fatal){
                if(data.type === Hls.ErrorTypes.NETWORK_ERROR){
                    console.error("Network error occurred while loading HLS stream:", data);
                    hls.startLoad();
                } else if(data.type === Hls.ErrorTypes.MEDIA_ERROR){
                    console.error("Media error occurred while playing HLS stream:", data);
                    hls.recoverMediaError();
                } else {
                    console.error("Fatal error occurred in HLS.js:", data);
                    hls.destroy();
                }
            }
        });
        hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
            console.log(`📥 Loading segment ${data.frag.sn}...`);
            const bufferLength = videoElement.buffered.length > 0 
                ? videoElement.buffered.end(videoElement.buffered.length - 1) - videoElement.currentTime
                : 0;
            console.log(`   Current buffer: ${bufferLength.toFixed(2)}s`);
            console.log(`   Segment duration: ${data.frag.duration}s`);
        });

        hls.on(Hls.Events.FRAG_LOADED, (event, data)=>{
            console.log(`✓ Segment ${data.frag.sn} loaded successfully`);
            console.log(`   URL: ${data.frag.url}`);
            console.log(`   Fragment duration: ${data.frag.duration}s`);
            
            const bufferLength = videoElement.buffered.length > 0 
                ? videoElement.buffered.end(videoElement.buffered.length - 1) - videoElement.currentTime
                : 0;
            console.log(`   Total buffered: ${bufferLength.toFixed(2)}s`);
            console.log(`   Playback position: ${videoElement.currentTime.toFixed(2)}s`);
        });

        hls.on(Hls.Events.FRAG_CHANGED, (event, data) => {
            if (data.frag) {
                console.log(`▶️ Playing segment ${data.frag.sn}`);
                console.log(`   Time: ${videoElement.currentTime.toFixed(2)}s / ${videoElement.duration ? videoElement.duration.toFixed(2) : 'N/A'}s`);
                console.log(`   Fragment duration: ${data.frag.duration}s`);
                console.log(`   Fragment level: ${data.frag.level}`);
            }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
            const level = hls.levels[data.level];
            console.log(`📊 Quality switched to level ${data.level}`);
            console.log(`   Resolution: ${level.width}x${level.height}p`);
            console.log(`   Bitrate: ${(level.bitrate / 1000).toFixed(0)} kbps`);
            console.log(`   Codecs: ${level.codecs}`);
        });

        hls.on(Hls.Events.LEVEL_LOADED, (event, data)=>{
            console.log(`📦 Level ${data.level} loaded`);
            console.log(`   Segments in playlist: ${data.details.fragments.length}`);
            console.log(`   Total duration: ${data.details.totalduration.toFixed(2)}s`);
        });
        hls.loadSource(videoURL);
        hls.attachMedia(videoElement);
    }
    else if(videoElement.canPlayType("application/vnd.apple.mpegurl")){
        videoElement.src = videoURL;
        videoElement.addEventListener("loadedmetadata", ()=>{
            videoElement.play().catch(error=>{
                console.error("Error playing video with native HLS support:", error);
            });
        });
    }

}