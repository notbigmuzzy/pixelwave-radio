import { usePeerConnection } from './hooks/usePeerConnection';
import { RemoteControl } from './components/remoteControl/RemoteControl';
import { ServerControl } from './components/serverControl/ServerControl';
import tracksData from './api/80s.json';
import type { Station } from './types';

const stationList: Station[] = tracksData;

function App() {
	const { peerId, connection, lastMessage, sendMessage, isHost } = usePeerConnection();

	// Remote Logic handlers
	const handleRemotePlayPause = () => sendMessage({ type: 'PLAY_PAUSE' });
	const handleRemoteVolume = (val: number) => sendMessage({ type: 'SET_VOLUME', value: val });
	const handleRemoteStation = (s: Station) => sendMessage({ type: 'SET_STATION', station: s });

	if (!isHost) {
		return (
			<RemoteControl
				connectionStatus={connection ? 'Connected' : 'Connecting...'}
				onPlayPause={handleRemotePlayPause}
				onVolumeChange={handleRemoteVolume}
				onStationSelect={handleRemoteStation}
				stationList={stationList}
			/>
		);
	}

	return (
		<ServerControl
			peerId={peerId}
			connection={connection}
			lastMessage={lastMessage}
		/>
	);
}

export default App
