import styles from './RemoteControl.module.scss';
import type { Station } from '../../types';

interface RemoteControlProps {
	connectionStatus: string;
	onPlayPause: () => void;
	onVolumeChange: (val: number) => void;
	onStationSelect: (station: Station) => void;
	stationList: Station[];
}

export const RemoteControl = ({
	onPlayPause,
	onVolumeChange,
	onStationSelect,
	stationList
}: RemoteControlProps) => {
	return (
		<div className={styles.remoteContainer}>
			<div className={styles.topBar}>
				<div className={styles.playButtonContainer}>
					<button
						onClick={onPlayPause}
						className={styles.playButton}
					>
						⏯
					</button>
				</div>
				<div className={styles.volumeContainer}>
					<label>Volume</label>
					<input
						type="range"
						min="0"
						max="1"
						step="0.1"
						onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
					/>
				</div>
			</div>

			<div className={styles.bottomBar}>
				<h3 className={styles.title}>Change Station</h3>
				<div className={styles.stationGrid}>
					{stationList.map(s => (
						<button
							key={s.stationuuid}
							onClick={() => onStationSelect(s)}
							className={styles.stationButton}
						>
							{s.name}
						</button>
					))}
				</div>
			</div>

		</div>
	);
};
