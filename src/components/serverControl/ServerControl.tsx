import { useEffect, useState, useRef } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { QRCodeSVG } from 'qrcode.react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import type { PeerMessage, Station } from '../../types';
import type { DataConnection } from 'peerjs';
import styles from './ServerControl.module.scss';
import defaultBg from '../../assets/80s.jpg';
import { ButterchurnVisualizer } from './ButterchurnVisualizer';
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

	const getInitialSlide = () => {
		const stored = localStorage.getItem('pixelwave_slide_index');
		return stored ? parseInt(stored, 10) : 4; // Default to 80s (index 4)
	};

	const [nav1, setNav1] = useState<Slider | null>(null);
	const [nav2, setNav2] = useState<Slider | null>(null);
	const [activeSlide, setActiveSlide] = useState(getInitialSlide);
	const slider1 = useRef<Slider>(null);
	const slider2 = useRef<Slider>(null);

	useEffect(() => {
		setNav1(slider1.current);
		setNav2(slider2.current);
	}, []);

	const [isLoadingRandom, setIsLoadingRandom] = useState(false);

	const playRandomStation = async (decadeId: string) => {
		if (isLoadingRandom) return;
		setIsLoadingRandom(true);

		try {
			const tag = decadeId;
			const cacheBuster = new Date().getTime();
			const response = await fetch(`https://de1.api.radio-browser.info/json/stations/search?tag=${tag}&limit=5&order=random&hidebroken=true&https=true&_=${cacheBuster}`, {
				cache: 'no-store'
			});

			if (!response.ok) throw new Error('Failed to fetch random stations');

			const stations = await response.json();

			if (stations && stations.length > 0) {
				const randomStation = stations[0];
				setStation(randomStation);
			} else {
				console.warn('No random stations found');
			}
		} catch (error) {
			console.error('Error fetching random station:', error);
		} finally {
			setIsLoadingRandom(false);
		}
	};

	const {
		currentStation,
		isPlaying,
		togglePlayPause,
		setStation
	} = usePlayerStore();

	const [favourites, setFavourites] = useState<Station[]>(() => {
		try {
			const stored = localStorage.getItem('pixelwave_favourites');
			return stored ? JSON.parse(stored) : [];
		} catch (e) {
			console.error('Failed to parse favourites', e);
			return [];
		}
	});

	const isFavourite = (station: Station | null) => {
		if (!station?.stationuuid) return false;
		return favourites.some(f => f.stationuuid === station.stationuuid);
	};

	const toggleFavourite = () => {
		if (!currentStation || !currentStation.stationuuid) return;

		let newFavourites;

		if (isFavourite(currentStation)) {
			newFavourites = favourites.filter(f => f.stationuuid !== currentStation.stationuuid);
		} else {
			const { stationuuid, name, favicon, url_resolved } = currentStation;
			const stationToSave: Station = {
				stationuuid,
				name,
				favicon,
				url_resolved
			};

			newFavourites = [...favourites, stationToSave];
		}

		setFavourites(newFavourites);
		localStorage.setItem('pixelwave_favourites', JSON.stringify(newFavourites));
	};

	useEffect(() => {
		if (!lastMessage) return;

		switch (lastMessage.type) {
			case 'PLAY_PAUSE':
				togglePlayPause();
				break;
			case 'SET_STATION':
				if (lastMessage.station) {
					setStation(lastMessage.station);
				}
				break;
		}

	}, [lastMessage, togglePlayPause, setStation]);

	const initialSlideIndex = getInitialSlide();

	const settings = {
		dots: false,
		infinite: false,
		speed: 450,
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: true,
		initialSlide: initialSlideIndex,
		asNavFor: nav2 as Slider | undefined,
		beforeChange: (_current: number, next: number) => {
			setActiveSlide(next);
			localStorage.setItem('pixelwave_slide_index', next.toString());

			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		}
	};

	const bgSettings = {
		dots: false,
		infinite: false,
		speed: 450,
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: false,
		initialSlide: initialSlideIndex,
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
										<p>
											<button
												className={`${styles.favouriteButton} ${isFavourite(currentStation) ? styles.favorited : ''}`}
												onClick={toggleFavourite}
												disabled={!currentStation}
											>
												{isFavourite(currentStation) ? '★ Favorited' : '☆ Favourite'}
											</button>
										</p>
										<h2 className={styles.decadeTitle}>
											<span>{decade.label}</span>
										</h2>
										<button
											className={`${styles.playButton} ${isPlaying ? styles.playing : styles.paused}`}
											onClick={togglePlayPause}
											disabled={!currentStation}
										>
											{isPlaying ? 'Pause' : 'Play ►'}
										</button>
									</div>
									<div className={styles.leftSide}>
										<div className={styles.playingDetails}>
											{currentStation ? (
												<div>
													<div className={styles.nowPlaying}>
														<div className={styles.stationInfo}>
															{currentStation.favicon && <img src={currentStation.favicon} alt="Station Cover" className={styles.coverImage} />}
															<strong><i></i>{currentStation.name}</strong>
														</div>
														<i className={styles.nowPlayingDetails}>
															<em>{currentStation.country}</em>
														</i>
													</div>
												</div>
											) : (
												<p className={styles.noTrack}>No Station Selected</p>
											)}
										</div>
										{currentStation && (
											<div className={styles.remoteSection}>
												{peerId ? (
													<div className={styles.qrContainer}>
														<QRCodeSVG
															value={`${window.location.origin}${window.location.pathname}?remote=${peerId}`}
															size={170}
															fgColor="#fff"
															bgColor="transparent"
															level="H"
															marginSize={1}
														/>
													</div>
												) : (
													<span>Generisanje QR Koda...</span>
												)}
											</div>
										)}
									</div>
									<div className={styles.rightSide}>
										<div
											className={styles.stationListContainer}
											onMouseDown={(e) => e.stopPropagation()}
											onTouchMove={(e) => e.stopPropagation()}
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
											<div className={styles.randomButtonContainer}>
												<hr />
												<button
													className={styles.randomButton}
													onClick={() => playRandomStation(decade.id)}
													disabled={isLoadingRandom}
												>
													{isLoadingRandom ? (
														<>
															<span className={styles.spinner}></span>
															Finding station...
														</>
													) : (
														<>
															I'm feeling lucky! <i style={{ width: '100%' }} /> ♪♫
														</>
													)}
												</button>
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
				<div className={styles.visualizerContainer}>
					{connection && <ButterchurnVisualizer isPlaying={isPlaying} />}
				</div>

				<div className={styles.playingDetails}>
					{currentStation ? (
						<p className={styles.nowPlaying}>
							<strong>{currentStation.name}</strong>
							<i className={styles.nowPlayingDetails}>
								{currentStation.favicon && <img src={currentStation.favicon} alt="Station Cover" className={styles.coverImage} />}
								<em>{currentStation.country}</em>
							</i>
						</p>
					) : (
						<p>No Station Selected</p>
					)}
				</div>
			</div>
		</div>
	);
};
