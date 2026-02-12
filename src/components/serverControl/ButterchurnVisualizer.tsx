import { useEffect, useRef, useState } from 'react';
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';

interface ButterchurnVisualizerProps {
	isPlaying: boolean;
}

export const ButterchurnVisualizer = ({ isPlaying }: ButterchurnVisualizerProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [visualizer, setVisualizer] = useState<any>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		let ctx: AudioContext | null = null;
		let schedulerTimeout: ReturnType<typeof setTimeout>;

		const init = async () => {
			ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

			const churn = butterchurn.createVisualizer(ctx, canvas, {
				width: canvas.width,
				height: canvas.height,
				pixelRatio: window.devicePixelRatio || 1,
				textureRatio: 1,
			});

			const presets = butterchurnPresets.getPresets();
			const presetKeys = Object.keys(presets);
			const randomKey = presetKeys[Math.floor(Math.random() * presetKeys.length)];
			churn.loadPreset(presets[randomKey], 0.0);

			setVisualizer(churn);

			const dummyDestination = ctx.createGain();
			dummyDestination.gain.value = 0.0;

			churn.connectAudio(dummyDestination);

			const scheduleBeat = (time: number) => {
				if (!ctx) return;

				const osc = ctx.createOscillator();
				const gain = ctx.createGain();

				osc.connect(gain);
				gain.connect(dummyDestination);

				osc.frequency.setValueAtTime(150, time);
				osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

				gain.gain.setValueAtTime(1, time);
				gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

				osc.start(time);
				osc.stop(time + 0.5);
			};

			const lookahead = 25.0;
			const scheduleAheadTime = 0.1;
			let nextNoteTime = ctx.currentTime;

			const scheduler = () => {
				if (!ctx) return;
				while (nextNoteTime < ctx.currentTime + scheduleAheadTime) {
					scheduleBeat(nextNoteTime);
					nextNoteTime += 0.5;
				}
				schedulerTimeout = setTimeout(scheduler, lookahead);
			};

			scheduler();
		};

		init();

		return () => {
			if (schedulerTimeout) clearTimeout(schedulerTimeout);
			if (ctx) ctx.close();
		};
	}, []);

	useEffect(() => {
		if (!visualizer) return;

		const presets = butterchurnPresets.getPresets();
		const presetKeys = Object.keys(presets);

		let timeoutId: ReturnType<typeof setTimeout>;

		const cyclePreset = () => {
			const randomKey = presetKeys[Math.floor(Math.random() * presetKeys.length)];

			visualizer.loadPreset(presets[randomKey], 2.7);

			const nextDelay = Math.random() * 10000 + 10000;
			timeoutId = setTimeout(cyclePreset, nextDelay);
		};

		const initialDelay = Math.random() * 10000 + 10000;
		timeoutId = setTimeout(cyclePreset, initialDelay);

		return () => clearTimeout(timeoutId);
	}, [visualizer]);

	useEffect(() => {
		const handleResize = () => {
			const canvas = canvasRef.current;
			if (canvas && visualizer) {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
				visualizer.setRendererSize(window.innerWidth, window.innerHeight);
			}
		};

		window.addEventListener('resize', handleResize);
		handleResize();
		return () => window.removeEventListener('resize', handleResize);
	}, [visualizer]);

	useEffect(() => {
		if (!visualizer) return;

		let animationFrameId: number;

		const render = () => {
			if (isPlaying) {
				visualizer.render();
			}
			animationFrameId = requestAnimationFrame(render);
		};

		render();

		return () => cancelAnimationFrame(animationFrameId);
	}, [visualizer, isPlaying]);

	return (
		<canvas
			ref={canvasRef}
			style={{
				width: '100%',
				height: '100%',
				display: 'block',
				position: 'absolute',
				top: 0,
				left: 0
			}}
		/>
	);
};
