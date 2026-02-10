# PixelWave TODO
**Goal:** Create an immersive audio experience where the phone is the remote control, using the React ecosystem to the max.
**Tech:** React, TypeScript, Vite, Peer.js (WebRTC), Zustand, Framer Motion

---

# PHASE 1: Audio Engine & Architecture (The Core)
1.  **Stack & Types:**
    *   Setup: `npm create vite@latest sonicsync -- --template react-ts`.
    *   Defining types: `Track`, `PlayerState`, `PeerMessage`.
2.  **State Management (Zustand):**
    *   Why Zustand? Because React Context creates too many re-renders for an audio player (every second changes state).
    *   Store: `usePlayerStore` (volume, isPlaying, currentTrack, currentTime).
3.  **The Audio Hook `useAudio(url)`:**
    *   Hook wrapping `new Audio()`.
    *   Exposes methods: `play()`, `pause()`, `seek(time)`.
    *   **Challenge:** Ensure audio continues playing even if the component re-renders (use `useRef` for the audio instance).

# PHASE 2: The Visuals (Eye Candy)
1.  **Immersive UI:**
    *   Big, bold design. Album art that rotates or pulses.
    *   Use **Framer Motion** for smooth transitions between songs.
2.  **Audio Visualization (Canvas):**
    *   Connect `<audio>` to `AudioContext` -> `AnalyserNode`.
    *   Draw frequencies (bars or cool shapes) on `<canvas>` in a `requestAnimationFrame` loop.
    *   **React Challenge:** How to integrate Canvas imperative code into the React declarative world.

# PHASE 3: Station Manager
1.  **Station Manager Modal:**
    *   CRUD for radio stations (Add/Edit/Delete).
    *   **Tech:** React Hook Form + Zod (URL and name validation).
2.  **Persistence:**
    *   Saving custom stations to `localStorage`.

# PHASE 4: The Connection (WebRTC / Peer.js)
1.  **Connection Manager Hook (`usePeerConnection`):**
    *   Initializes Peer.js instance.
    *   Generates session ID.
    *   Handles events: `connection`, `data`, `close`, `error`.
2.  **QR Handshake:**
    *   Laptop (Host) generates URL `myapp.com/remote?id=XYZ`.
    *   Generates QR code for that URL.
3.  **Data Protocol:**
    *   Define strict message format in TypeScript:
        ```typescript
        type Action =
          | { type: 'PLAY_PAUSE' }
          | { type: 'SET_VOLUME', value: number }
          | { type: 'SEEK', time: number };
        ```

# PHASE 5: The Remote Control
1.  **Mobile Interface:**
    *   Big buttons (Touch friendly).
    *   Slider for Volume working in real-time.
    *   Haptic Feedback (`navigator.vibrate`) when pressing a button.
2.  **Two-way Sync:**
    *   When Remote changes song -> Host changes song.
    *   When Host changes song (finishes) -> Remote must receive update "New song is playing".

# PHASE 5: Polish & Optimizations
1.  **Persistence:**
    *   Remember volume and playlist in `localStorage` (Zustand middleware).
2.  **Resilience:**
    *   "Connection Lost" screen if someone closes the tab.
    *   Auto-reconnect logic.
3.  **Deploy:**
    *   Vercel (because it supports SPA routing excellently and is free).

---

**Learning Potential**
- **Refs vs State:** Learn when to use `useRef` (for WebRTC connections and Audio objects) and when `useState` (for UI)
- **Cleanup:** Learn how to clean up event listeners in `useEffect`
- **Context/Zustand:** Global state outside the React render tree
