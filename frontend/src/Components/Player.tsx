import { useRef, useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";

interface Song {
  id: string;
  name: string;
  url: string;
}

interface PlayerProps {
  currentSong: Song | null;
}

const Player = ({ currentSong }: PlayerProps) => {
  console.log(`CHECKING ENV ${process.env.REACT_APP_BACKEND_URL}`);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);

  // Effect that triggers when currentSong changes
  useEffect(() => {
    if (currentSong && audioRef.current) {
      // Set new audio source
      console.log(currentSong)
      audioRef.current.src = `${currentSong.url}`;
      audioRef.current.load(); // Reload the audio element
      
      // Reset progress
      setProgress(0);
      
      // Auto-play the new song
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
    }
  }, [currentSong?.name]); // Only trigger when song name changes

  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play()
        .catch((error) => {
          console.error('Error playing audio:', error);
        });
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const percent =
      (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(percent || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime =
      (parseFloat(e.target.value) / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  // Handle audio events
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="flex justify-center items-end pb-4 bg-black h-full w-[75%]">
      <div className="w-[80%] bg-gray-900 text-white rounded-2xl p-6 shadow-lg space-y-6 h-64">
        {/* Song Info */}
        <h2 className="text-xl font-semibold text-center">
          {currentSong?.name || 'No song selected'}
        </h2>
        
        {/* Progress Bar */}
        <div className="flex flex-col space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full accent-pink-500 cursor-pointer"
            disabled={!currentSong}
          />
          <audio
            ref={audioRef}
            src={currentSong?.url || ''}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onLoadStart={() => {
              setProgress(0);
              setIsPlaying(false);
            }}
          />
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center space-x-6">
          <button 
            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!currentSong}
          >
            <SkipBack className="w-6 h-6" />
          </button>
          
          <button
            onClick={togglePlay}
            className="p-4 bg-pink-500 hover:bg-pink-400 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!currentSong}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7" />
            )}
          </button>
          
          <button 
            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!currentSong}
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
        
        {/* Volume */}
        <div className="flex w-[30%] items-center space-x-3">
          <Volume2 className="w-5 h-5 text-gray-300" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Player;