import { create } from 'zustand';
import type { PlayerState, Station, PlaybackStatus } from '../types';

interface PlayerActions {
	setStation: (station: Station) => void;
	play: () => void;
	pause: () => void;
	togglePlayPause: () => void;
	setVolume: (volume: number) => void;
	setMuted: (muted: boolean) => void;
	setStatus: (status: PlaybackStatus) => void;
}


type PlayerStore = PlayerState & PlayerActions;
export const usePlayerStore = create<PlayerStore>((set) => ({
	currentStation: null,
	isPlaying: false,
	volume: 1.0,
	muted: false,
	status: 'paused',

	setStation: (station) => set(() => ({ currentStation: station, isPlaying: true, status: 'loading' })),
	play: () => set(() => ({ isPlaying: true, status: 'playing' })),
	pause: () => set(() => ({ isPlaying: false, status: 'paused' })),
	togglePlayPause: () => set((state) => ({
		isPlaying: !state.isPlaying,
		status: !state.isPlaying ? 'playing' : 'paused'
	})),
	setVolume: (volume) => set(() => ({ volume: Math.max(0, Math.min(1, volume)) })),
	setMuted: (muted) => set(() => ({ muted })),
	setStatus: (status) => set(() => ({ status })),
}));
