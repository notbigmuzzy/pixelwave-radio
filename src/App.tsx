import { useAudioEngine } from './hooks/useAudioEngine';
import { usePlayerStore } from './store/usePlayerStore';
import tracksData from './api/80s.json';
import type { Track } from './types';
import styles from './App.module.scss';

const stationList: Track[] = tracksData;

function App() {
	useAudioEngine();
	const {
		currentStation,
		isPlaying,
		status,
		volume,
		togglePlayPause,
		setStation,
		setVolume
	} = usePlayerStore();

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>PixelWave Radio</h1>

			<div className={styles.statusBar}>
				<h3>Now Playing:</h3>
				{currentStation ? (
					<div>
						<p><strong>{currentStation.name}</strong></p>
						<p>Status: <span className={`${styles.statusText} ${isPlaying ? styles.playing : styles.paused}`}>{status}</span></p>
					</div>
				) : (
					<p>No Track Selected</p>
				)}
			</div>

			<div className={styles.controls}>
				<button
					className={styles.playButton}
					onClick={togglePlayPause}
					disabled={!currentStation}
				>
					{isPlaying ? '⏸ Pause' : '▶ Play'}
				</button>

				<div className={styles.volumeControl}>
					<label>Volume: {Math.round(volume * 100)}%</label>
					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={volume}
						onChange={(e) => setVolume(parseFloat(e.target.value))}
					/>
				</div>
			</div>

			<h3>Select a Station:</h3>
			<div className={styles.stationList}>
				{stationList.map(station => (
					<button
						key={station.stationuuid}
						onClick={() => setStation(station)}
					>
						{station.name}
					</button>
				))}
			</div>
		</div>
	)
}

export default App
