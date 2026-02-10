import { useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';
import { usePlayerStore } from '../store/usePlayerStore';

export const useAudioEngine = () => {
	const soundRef = useRef<Howl | null>(null);

	const {
		currentStation,
		isPlaying,
		volume,
		muted,
		pause,
		setStatus
	} = usePlayerStore();

	useEffect(() => {
		if (!currentStation) return;

		setStatus('loading');

		const sound = new Howl({
			src: [currentStation.url_resolved],
			html5: true,
			format: ['mp3', 'aac', 'm4a'],
			volume: volume,
			mute: muted,
			autoplay: isPlaying,
			onload: () => {
				setStatus(isPlaying ? 'playing' : 'paused');
			},
			onplay: () => {
				setStatus('playing');
			},
			onpause: () => {
				setStatus('paused');
			},
			onend: () => {
				setStatus('paused');
				pause();
			},
			onloaderror: (_id, error) => {
				console.error("Howl Load Error:", error);
				setStatus('error');
			},
			onplayerror: (_id, error) => {
				console.error("Howl Play Error:", error);
				setStatus('error');
			}
		});

		soundRef.current = sound;

		return () => {
			sound.unload();
		};
	}, [currentStation?.stationuuid]);

	useEffect(() => {
		const sound = soundRef.current; if (!sound) return;
		const enginePlaying = sound.playing();

		if (isPlaying && !enginePlaying) {
			if (sound.state() === 'loaded') {
				sound.play();
			}
		} else if (!isPlaying && enginePlaying) {
			sound.pause();
		}
	}, [isPlaying]);

	useEffect(() => {
		Howler.volume(volume);
		Howler.mute(muted);
	}, [volume, muted]);

	useEffect(() => {
		return () => {
			if (soundRef.current) {
				soundRef.current.unload();
			}
		};
	}, []);
};
