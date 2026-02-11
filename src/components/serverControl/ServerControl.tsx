import { useEffect, useState, useRef } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { QRCodeSVG } from 'qrcode.react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import type { PeerMessage } from '../../types';
import type { DataConnection } from 'peerjs';
import styles from './ServerControl.module.scss';
import defaultBg from '../../assets/80s.jpg';
const stationDataModules = import.meta.glob('../../api/*.json', { eager: true, import: 'default' });
const bgModules = import.meta.glob('../../assets/*.jpg', { eager: true, import: 'default' });
const decadeIds = ['40s', '50s', '60s', '70s', '80s', '90s', '00s', '10s', '20s'];

const decades = decadeIds.map(id => ({
	id,
	label: ['00s', '10s', '20s'].includes(id) ? `20${id === '00s' ? '00' : id.slice(0, 2)}s` : `19${id}`,
	data: stationDataModules[`../../api/${id}.json`] as any,
	bg: bgModules[`../../assets/${id}.jpg`] as string || defaultBg
}));

interface ServerControlProps {
	peerId: string | null;
	connection: DataConnection | null;
	lastMessage: PeerMessage | null;
}

export const ServerControl = ({ peerId, connection, lastMessage }: ServerControlProps) => {
	useAudioEngine();

	const [nav1, setNav1] = useState<Slider | null>(null);
	const [nav2, setNav2] = useState<Slider | null>(null);
	const [activeSlide, setActiveSlide] = useState(4);
	const slider1 = useRef<Slider>(null);
	const slider2 = useRef<Slider>(null);

	useEffect(() => {
		setNav1(slider1.current);
		setNav2(slider2.current);
	}, []);

	const {
		currentStation,
		isPlaying,
		status,
		togglePlayPause,
		setStation
	} = usePlayerStore();

	useEffect(() => {
		if (!lastMessage) return;

		switch (lastMessage.type) {
			case 'PLAY_PAUSE':
				togglePlayPause();
				break;
			case 'SET_VOLUME':
				// setVolume(lastMessage.value);
				break;
			case 'SET_STATION':
				if (lastMessage.station) {
					setStation(lastMessage.station);
				}
				break;
		}

	}, [lastMessage, togglePlayPause, setStation]);

	const settings = {
		dots: false,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: true,
		initialSlide: 4, // 80s
		asNavFor: nav2 as Slider | undefined,
		beforeChange: (_current: number, next: number) => {
			setActiveSlide(next);
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		}
	};

	const bgSettings = {
		dots: false,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: false,
		initialSlide: 4,
		fade: true,
		asNavFor: nav1 as Slider | undefined,
		accessibility: false,
		draggable: false
	};

	const isSlideVisible = (index: number) => {
		const total = decades.length;
		const prev = (activeSlide - 1 + total) % total;
		const next = (activeSlide + 1) % total;
		return index === activeSlide || index === prev || index === next;
	};

	return (
		<div className={`${styles.container} ${connection ? styles.playerConnected : styles.playerDisconnected}`}>
			<div className={styles.showWhenPlayerDisconnected}>
				<div className={styles.sliderWrapper}>
					<div className={styles.backgroundSliderWrapper}>
						<Slider {...bgSettings} ref={slider2} className={styles.bgSlider}>
							{decades.map((decade) => (
								<div key={decade.id} className={styles.bgSlide}>
									<img src={decade.bg} alt={`${decade.label} Background`} />
								</div>
							))}
						</Slider>
					</div>
					<Slider {...settings} ref={slider1} className={styles.slickSlider}>
						{decades.map((decade, index) => (
							<div key={decade.id} className={styles.slideContainer}>
								<div className={styles.slide}>
									<img src={decade.bg} alt="Background" className={styles.radioIcon} />
									<i className={styles.overlay}></i>
									<div className={styles.topBar}>
										<p className={`${styles.statusText} ${isPlaying ? styles.playing : styles.paused}`}>
											{status}
										</p>
										<h2 className={styles.decadeTitle}>{decade.label}</h2>
										<button
											className={styles.playButton}
											onClick={togglePlayPause}
											disabled={!currentStation}
										>
											{isPlaying ? 'Pause' : 'Play'}
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
										<div className={styles.remoteSection}>
											{peerId ? (
												<div className={styles.qrContainer}>
													<QRCodeSVG value={`${window.location.protocol}//${window.location.host}?remote=${peerId}`} size={100} />
												</div>
											) : (
												<span>Generisanje QR Koda...</span>
											)}
										</div>
									</div>
									<div className={styles.rightSide}>
										<div
											className={styles.stationListContainer}
											onMouseDown={(e) => e.stopPropagation()}
											onTouchStart={(e) => e.stopPropagation()}
										>
											<div className={styles.stationList}>
												{isSlideVisible(index) ? decade.data.map((station: any) => (
													<button
														key={station.stationuuid}
														className={`${currentStation?.stationuuid === station.stationuuid ? styles.active : ''}`}
														onClick={() => setStation(station)}
													>
														{station.name}
													</button>
												)) : null}
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</Slider>
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
