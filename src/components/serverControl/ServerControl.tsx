import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import type { Station, PeerMessage } from '../../types';
import type { DataConnection } from 'peerjs';
import styles from './ServerControl.module.scss';
import tracksData from '../../api/80s.json';
import bgImage from '../../assets/80s.jpg';

const stationList: Station[] = tracksData;

interface ServerControlProps {
	peerId: string | null;
	connection: DataConnection | null;
	lastMessage: PeerMessage | null;
}

export const ServerControl = ({ peerId, connection, lastMessage }: ServerControlProps) => {
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

	useEffect(() => {
		if (!lastMessage) return;

		switch (lastMessage.type) {
			case 'PLAY_PAUSE':
				togglePlayPause();
				break;
			case 'SET_VOLUME':
				setVolume(lastMessage.value);
				break;
			case 'SET_STATION':
				if (lastMessage.station) {
					setStation(lastMessage.station);
				}
				break;
		}

	}, [lastMessage, togglePlayPause, setVolume, setStation]);

	return (
		<div className={`${styles.container} ${connection ? styles.playerConnected : styles.playerDisconnected}`}>
			<div className={styles.showWhenPlayerDisconnected}>
				<div className={styles.slider}>
					<img src={bgImage} alt="Background" className={styles.radioIcon} />
					<div className={styles.slide}>
						<img src={bgImage} alt="Background" className={styles.radioIcon} />
						<i className={styles.overlay}></i>
						<div className={styles.topBar}>
							<p>
								<span className={`${styles.statusText} ${isPlaying ? styles.playing : styles.paused}`}>
									{status}
								</span>
							</p>
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
							<button
								className={styles.playButton}
								onClick={togglePlayPause}
								disabled={!currentStation}
							>
								{isPlaying ? '⏸ Pause' : '▶ Play'}
							</button>

						</div>
						<div className={styles.leftSide}>
							<div className={styles.statusBar}>
								{currentStation ? (
									<div>
										<p className={styles.nowPlaying}>
											{currentStation.favicon && <img src={currentStation.favicon} alt="Station Cover" className={styles.coverImage} />}
											<strong>{currentStation.name}</strong>
											<i><em>{currentStation.country}</em></i>
										</p>

									</div>
								) : (
									<p>No Track Selected</p>
								)}
							</div>
							{/* <div className={styles.remoteSection}>
								{peerId ? (
									<div className={styles.qrContainer}>
										<QRCodeSVG value={`${window.location.protocol}//${window.location.host}?remote=${peerId}`} size={100} />
									</div>
								) : (
									<span>Generisanje QR Koda...</span>
								)}
							</div> */}
						</div>
						<div className={styles.rightSide}>
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
				</div>
			</div>
			<div className={styles.showWhenPlayerConnected}>
				<div className={styles.statusBar}>
					<h3>Now Playing:</h3>
					{currentStation ? (
						<div>
							<p className={styles.nowPlaying}>
								{currentStation.favicon && <img src={currentStation.favicon} alt="Station Cover" className={styles.coverImage} />}
								<strong>{currentStation.name}</strong>
								<i><em>{currentStation.country}</em></i>
							</p>
							<p>
								<span className={`${styles.statusText} ${isPlaying ? styles.playing : styles.paused}`}>
									{status}
								</span>
							</p>
						</div>
					) : (
						<p>No Track Selected</p>
					)}
				</div>
			</div>
		</div>
	);
};
