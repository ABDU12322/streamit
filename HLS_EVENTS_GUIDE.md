## HLS.js Events Quick Reference

### 🔴 MUST HAVE (Essential for playback)

| Event | Fired When | Action You Should Take |
|-------|-----------|----------------------|
| **MANIFEST_PARSED** | Playlist loaded & ready | Start video playback |
| **ERROR** | Something breaks | Handle gracefully (retry/skip) |

---

### 🟡 SHOULD HAVE (For better UX)

| Event | Fired When | Action You Should Take |
|-------|-----------|----------------------|
| **FRAG_LOADED** | Each segment downloaded | Update buffering progress |
| **FRAG_LOADING** | Before segment downloads | Show "loading..." indicator |
| **FRAG_CHANGED** | Playback moves to new segment | Track current playback position |
| **LEVEL_SWITCHED** | Quality changes | Show current video quality |

---

### 🔵 OPTIONAL (Nice to have)

| Event | Fired When | Action You Should Take |
|-------|-----------|----------------------|
| **BUFFER_APPENDING** | Adding to buffer | Optional: Show buffering |
| **BUFFER_APPENDED** | Buffer ready | Optional: Hide buffering |
| **LEVEL_LOADED** | Quality info loaded | Track available qualities |

---

## 📊 Event Flow During Playback

```
1. User visits page
   ↓
2. MANIFEST_PARSED 
   → Action: Start playback ✓
   ↓
3. FRAG_LOADING (Segment 0)
   → Action: Show spinner
   ↓
4. FRAG_LOADED (Segment 0)
   → Action: Update progress
   ↓
5. FRAG_CHANGED (playing Segment 0)
   → Action: Track position
   ↓
6. (After 10s) FRAG_LOADING (Segment 1)
   → Action: Show spinner again
   ↓
7. FRAG_LOADED (Segment 1)
   → Action: Update progress
   ↓
... continues until video ends
```

---

## 🚨 Error Handling Flow

```
ERROR fires
   ↓
Is it FATAL?
   ├─ YES (fatal: true)
   │  ├─ NETWORK_ERROR? → Retry with hls.startLoad()
   │  ├─ MEDIA_ERROR? → Skip with hls.recoverMediaError()
   │  └─ OTHER? → Stop and show error to user
   │
   └─ NO (fatal: false)
      → Log warning but don't stop playback
```

---

## ✅ Minimal Working Code

```typescript
const hls = new Hls();

// ⭐ REQUIRED
hls.on(Hls.Events.MANIFEST_PARSED, () => {
    videoElement.play();
});

hls.on(Hls.Events.ERROR, (event, data) => {
    if (data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
        }
    }
});

// 🟢 OPTIONAL but recommended
hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
    console.log(`Segment ${data.frag.sn} ready`);
});

// Setup
hls.loadSource(hlsURL);
hls.attachMedia(videoElement);
```

---

## 💡 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Video starts but stops at random | Handle FRAG_LOADED errors with ERROR handler |
| Buffer keeps emptying | Increase `maxBufferLength` in HLS config |
| Segments never load | Ensure MANIFEST_PARSED fires first |
| Quality jumps around too much | Implement LEVEL_SWITCHED to track changes |
| Mobile autoplay blocked | Catch play() promise in MANIFEST_PARSED |

