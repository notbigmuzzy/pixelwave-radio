import { useEffect, useState, useRef } from 'react';
import Peer, { type DataConnection } from 'peerjs';
import type { PeerMessage } from '../types';

export const usePeerConnection = () => {
	const [peerId, setPeerId] = useState<string | null>(null);
	const [connection, setConnection] = useState<DataConnection | null>(null);
	const [lastMessage, setLastMessage] = useState<PeerMessage | null>(null);
	const [isHost, setIsHost] = useState(true);
	const peerRef = useRef<Peer | null>(null);
	const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const remotePeerId = urlParams.get('remote');
		let sessionId = urlParams.get('session');

		if (remotePeerId) {
			setIsHost(false);
		}

		if (!sessionId && !remotePeerId) {
			sessionId = Math.random().toString(36).substring(2, 7).toUpperCase();
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.set('session', sessionId);
			window.history.replaceState({}, '', newUrl.toString());
		}

		let peer: Peer;

		const timer = setTimeout(() => {
			peer = remotePeerId ? new Peer() : new Peer(sessionId as string);
			peerRef.current = peer;

			peer.on('open', (id) => {
				setPeerId(id);

				if (remotePeerId) {
					const conn = peer.connect(remotePeerId);

					conn.on('open', () => {
						setConnection(conn);
						conn.send({ type: 'GREETING', message: 'Mobile Remote Connected!' });
					});

					conn.on('data', (unknownData: unknown) => {
						const data = unknownData as PeerMessage;

						switch (data.type) {
							case 'HEARTBEAT':
								conn.send({ type: 'HEARTBEAT_ACK' });
								break;
							default:
								setLastMessage(data);
						}
					});

					conn.on('close', () => {
						setConnection(null);
					});
				}
			});

			peer.on('connection', (conn) => {
				setConnection(conn);
				let isWaitingForAck = false;

				conn.on('open', () => {
					conn.send({ type: 'WELCOME', message: 'Connected to PixelWave Radio' });

					heartbeatIntervalRef.current ? clearInterval(heartbeatIntervalRef.current) : null;
					watchdogTimerRef.current ? clearTimeout(watchdogTimerRef.current) : null;

					// We bruteforce this to check when controller disconnects without closing the connection properly
					// (e.g. mobile browser tab closed, for some reason beforeUnload doesn't fire off)
					heartbeatIntervalRef.current = setInterval(() => {
						if (conn.open) {

							if (isWaitingForAck) { return }

							try {
								isWaitingForAck = true;
								conn.send({ type: 'HEARTBEAT' });

								watchdogTimerRef.current = setTimeout(() => {
									conn.close();
									setConnection(null);
									heartbeatIntervalRef.current ? clearInterval(heartbeatIntervalRef.current) : null;
								}, 2000);
							} catch (e) {
								conn.close();
								setConnection(null);
								heartbeatIntervalRef.current ? clearInterval(heartbeatIntervalRef.current) : null;
							}
						} else {
							if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
						}
					}, 2000);
					// shaaame shaaame
					// but it works ;)
				});

				conn.on('data', (unknownData: unknown) => {
					const data = unknownData as PeerMessage;

					switch (data.type) {
						case 'HEARTBEAT_ACK':
							watchdogTimerRef.current ? clearTimeout(watchdogTimerRef.current) : null;
							isWaitingForAck = false;
							break;
						default:
							setLastMessage(data);
					}
				});

				conn.on('close', () => {
					heartbeatIntervalRef.current ? clearInterval(heartbeatIntervalRef.current) : null;
					watchdogTimerRef.current ? clearTimeout(watchdogTimerRef.current) : null;
					setConnection(null);
				});
			});

			peer.on('error', (err) => {
				console.error('PeerJS error:', err);
			});
		}, 100);

		return () => {
			clearTimeout(timer);
			heartbeatIntervalRef.current ? clearInterval(heartbeatIntervalRef.current) : null;
			watchdogTimerRef.current ? clearTimeout(watchdogTimerRef.current) : null;
			peer && !peer.destroyed ? peer.destroy() : null;
		};
	}, []);

	const sendMessage = (msg: PeerMessage) => {
		connection ? connection.send(msg) : null;
	};

	return {
		peerId,
		connection,
		lastMessage,
		sendMessage,
		isHost
	};
};
