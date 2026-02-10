import { useAudioEngine } from './hooks/useAudioEngine';
import { usePlayerStore } from './store/usePlayerStore';
import tracksData from './api/80s.json';
import type { Station } from './types';
import styles from './App.module.scss';

const stationList: Station[] = tracksData;

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
		<div id="app" className={styles.container}>
			<div className={styles.serverView}>
				<div className={styles.showWhenPlayerDisconnected}>
					<div className={styles.leftSide}>
						<h1 className={styles.title}>PixelWave Radio</h1>
						<div className={styles.statusBar}>
							<h3>Now Playing:</h3>
							{currentStation ? (
								<div>
									<p className={styles.nowPlaying}>
										{currentStation.favicon && <img src={currentStation.favicon} alt="Station Cover" className={styles.coverImage} />}
										<strong>{currentStation.name}</strong>
										<i>from <em>{currentStation.country}</em></i>
									</p>
									<p>
										Status:
										<span className={`${styles.statusText} ${isPlaying ? styles.playing : styles.paused}`}>
											{status}
										</span>
									</p>
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
					</div>
					<div className={styles.rightSide}>
						<h3 className={styles.title}>Select a Station:</h3>
						<div className={styles.stationList}>
							{stationList.map(station => (
								<button
									key={station.stationuuid}
									className={`${currentStation?.stationuuid === station.stationuuid ? styles.active : ''}`}
									onClick={() => setStation(station)}
								>
									{station.name}
								</button>
							))}
						</div>
					</div>
				</div>
				<div className={styles.showWhenPlayerConnected}>
					{/* Future view for when player is connected */}
					<p>Player Connected - Future UI coming soon!</p>
				</div>
			</div>
			<div className={styles.controllerView}>
				{/* Future controller view for mobile */}
			</div>
		</div>
	)
}

export default App
