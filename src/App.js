import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward } from 'react-icons/fi';

const Wrapper = styled.div`
  --pink: #ff74a4;
  --violet: #9f6ea3;
  --white: #ffffff;

  display: grid;
  place-items: center;
  height: 100vh;
  background: linear-gradient(var(--pink) 0%, var(--violet) 100%);
`;

const Card = styled.div`
  background: rgba(255, 230, 255, 0.9);
  border-radius: 15px;
  padding: 20px;
  width: 80%;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 230, 255, 1);
  }
`;

const FileInputWrapper = styled.label`
  background: var(--pink);
  color: var(--white);
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
  border: 2px solid var(--white);
  margin-bottom: 20px;

  &:hover {
    background: var(--pinkshadow);
    transform: scale(1.05);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const PlaylistContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 20px;
`;

const PlaylistItem = styled.div`
  background: rgba(255, 230, 255, 0.8);
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
  backdrop-filter: blur(10px);
  border: 2px solid var(--white);
  margin-bottom: 10px;

  &:hover {
    background: rgba(255, 230, 255, 1);
    transform: scale(1.03);
  }
`;

const TrackName = styled.div`
  font-size: 16px;
  margin-top: 10px;
`;

const AudioPlayer = styled.audio`
  width: 100%;
  margin-top: 20px;
`;

const ControlButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
`;

const IconButton = styled.button`
  background-color: var(--pink);
  color: var(--white);
  padding: 15px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--pinkshadow);
  }
`;

const PlayingViewWrapper = styled.div`
  background: linear-gradient(var(--violet) 0%, var(--pink) 100%);
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const NowPlayingText = styled.h3`
  color: var(--white);
  margin-bottom: 10px;
`;

const NowPlayingTrack = styled.p`
  color: var(--white);
  font-size: 18px;
  font-weight: bold;
`;

const PlayingView = ({ track }) => {
  return (
    <PlayingViewWrapper>
      <NowPlayingText>Now Playing:</NowPlayingText>
      <NowPlayingTrack>{track.name}</NowPlayingTrack>
    </PlayingViewWrapper>
  );
};

// Main App component
const App = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [playingTrack, setPlayingTrack] = useState(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      const dbName = 'musicDatabase';
      const request = window.indexedDB.open(dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore('musicStore', { autoIncrement: true, keyPath: 'id' });
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['musicStore'], 'readwrite');
        const objectStore = transaction.objectStore('musicStore');

        const getAllRequest = objectStore.getAll();
        getAllRequest.onsuccess = () => {
          setPlaylist(getAllRequest.result);
        };
      };
    };

    initializeDatabase();
  }, []);

  const addTrackToDatabase = (track) => {
    const dbName = 'musicDatabase';
    const request = window.indexedDB.open(dbName, 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['musicStore'], 'readwrite');
      const objectStore = transaction.objectStore('musicStore');

      const addRequest = objectStore.add(track);
      addRequest.onsuccess = () => {
        setPlaylist((prevPlaylist) => [...prevPlaylist, track]);
      };
    };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        const newTrack = { name: file.name, data: base64Data };
        addTrackToDatabase(newTrack);
      };
      reader.readAsDataURL(file);
    }
  };

  const playPauseHandler = () => {
    setIsPlaying(!isPlaying);
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
    }
  };

  const nextTrackHandler = () => {
    setCurrentTrack((prevTrack) => (prevTrack + 1) % playlist.length);
  };

  const prevTrackHandler = () => {
    setCurrentTrack((prevTrack) => (prevTrack - 1 + playlist.length) % playlist.length);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = playlist[currentTrack]?.data || '';
      setPlayingTrack(playlist[currentTrack]);
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [playlist,currentTrack, isPlaying]);

  return (
    <Wrapper>
      <Card>
        <FileInputWrapper>
          Choose File
          <FileInput type="file" accept=".mp3" onChange={handleFileUpload} />
        </FileInputWrapper>
        <PlaylistContainer>
          {playlist.map((track, index) => (
            <PlaylistItem key={index} onClick={() => setCurrentTrack(index)}>
              <TrackName>{track.name}</TrackName>
            </PlaylistItem>
          ))}
        </PlaylistContainer>
        {playingTrack && <PlayingView track={playingTrack} />}
        <AudioPlayer
          ref={audioRef}
          controls
          src={playlist[currentTrack]?.data || ''}
          onEnded={nextTrackHandler}
        />
        <ControlButtons>
          <IconButton onClick={prevTrackHandler}>
            <FiSkipBack />
          </IconButton>
          <IconButton onClick={playPauseHandler}>
            {isPlaying ? <FiPause /> : <FiPlay />}
          </IconButton>
          <IconButton onClick={nextTrackHandler}>
            <FiSkipForward />
          </IconButton>
        </ControlButtons>
      </Card>
    </Wrapper>
  );
};

export default App;
