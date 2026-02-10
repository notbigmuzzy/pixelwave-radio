export interface Station {
	url_resolved: string;
	stationuuid?: string;
	name?: string;
	artist?: string;
	coverUrl?: string;
	country?: string;
	favicon?: string;
}

export type PlaybackStatus = 'playing' | 'paused' | 'loading' | 'error';

export interface PlayerState {
	currentStation: Station | null;
	isPlaying: boolean;
	volume: number;
	muted: boolean;
	status: PlaybackStatus;
}

export type RemoteAction =
	| { type: 'PLAY' }
	| { type: 'PAUSE' }
	| { type: 'TOGGLE_PLAY_PAUSE' }
	| { type: 'SET_VOLUME'; value: number } // 0-1
	| { type: 'SEEK'; time: number } // seconds
	| { type: 'NEXT_TRACK' }
	| { type: 'PREV_TRACK' };

export type PeerMessage =
	| { type: 'GREETING'; message: string }
	| { type: 'WELCOME'; message: string }
	| { type: 'HEARTBEAT' }
	| { type: 'HEARTBEAT_ACK' }
	| { type: 'PLAY_PAUSE' }
	| { type: 'SET_VOLUME'; value: number }
	| { type: 'SET_STATION'; station: Station };
