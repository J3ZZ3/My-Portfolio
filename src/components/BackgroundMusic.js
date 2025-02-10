import React, { useState, useRef, useEffect, useCallback } from 'react';
import './BackgroundMusic.css';
import song1 from './audio/song1.mp3';
import song2 from './audio/song2.mp3';
import song3 from './audio/song3.mp3';
import song4 from './audio/song4.mp3';
import song5 from './audio/song5.mp3';
import song6 from './audio/song6.mp3';
import song7 from './audio/song7.mp3';
import song8 from './audio/song8.mp3';
import song9 from './audio/song9.mp3';
import song10 from './audio/song10.mp3';
import song11 from './audio/song11.mp3';
import song12 from './audio/song12.mp3';
import song13 from './audio/song13.mp3';

function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSongIndex, setCurrentSongIndex] = useState(
    Math.floor(Math.random() * 5) 
  );
  const audioRef = useRef(null);

  const songs = [
    {
      url: song1,
      title: "Song 1"
    },
    {
      url: song2,
      title: "Song 2"
    },
    {
      url: song3,
      title: "Song 3"
    },
    {
      url: song4,
      title: "Song 4"
    },
    {
      url: song5,
      title: "Song 5"
    },
    {
      url: song6,
      title: "Song 6"
    },
    {
      url: song7,
      title: "song 7"
    },
    {
      url: song8,
      title: "song 8"
    },
    {
      url: song9,
      title: "song 9"
    },
    { 
      url: song10,
      title: "song 10"
    },
    {
      url: song11,
      title: "song 11"
    },
    {
      url: song12,
      title: "song 12"
    },
    { 
      url: song13,
      title: "song 13"
    }
  ];

  // Function to get next random song index

  const getRandomSongIndex = useCallback((currentIndex) => {
    const newIndex = Math.floor(Math.random() * songs.length);
    // Ensure we don't play the same song twice in a row
    return newIndex === currentIndex ? getRandomSongIndex(currentIndex) : newIndex;
  }, [songs.length]);

  useEffect(() => {
    const audio = audioRef.current;
    
    const playAudio = async () => {
      try {
        if (audio) {
          await audio.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.log('Autoplay failed:', error);
        setIsPlaying(false);
      }
    };

    playAudio();

    const handleSongEnd = () => {
      setCurrentSongIndex(prevIndex => getRandomSongIndex(prevIndex));
    };

    audio.addEventListener('ended', handleSongEnd);

    return () => {
      audio.removeEventListener('ended', handleSongEnd);
      audio.pause();
    };
  }, [getRandomSongIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && isPlaying) {
      audio.play().catch(error => {
        console.log('Playback failed:', error);
        setIsPlaying(false);
      });
    }
  }, [currentSongIndex, isPlaying]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(error => {
          console.log('Playback failed:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  return (
    <div className="music-toggle">
      <audio
        ref={audioRef}
        src={songs[currentSongIndex]?.url}
        preload="auto"
      />
      <button onClick={togglePlay} className="music-button">
        {isPlaying ? (
          <ion-icon name="volume-high"></ion-icon>
        ) : (
          <ion-icon name="volume-mute"></ion-icon>
        )}
      </button>
    </div>
  );
}

export default BackgroundMusic; 