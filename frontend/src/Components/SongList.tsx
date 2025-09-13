import { useState, useEffect } from 'react';
import { Play } from "lucide-react";

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/';


interface DriveFile {
  kind: string;
  id: string;
  name: string;
  mimeType: string;
}

interface Song {
  id: string;
  name: string;
  url: string;
}

interface SongListProps {
  currentSong: Song | null;
  setCurrentSong: (song: Song) => void;
}

const SongList = ({ currentSong, setCurrentSong }: SongListProps) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch songs on component load
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        console.log("HERE");
        setLoading(true);
        console.log(backendUrl);
        const response = await fetch(`${backendUrl}listFiles`, {
          credentials: 'include' // Include cookies for authentication
        });
        
        if (response.ok) {
          const data = await response.json();
          // Ensure data is an array, if it's an object with files property, extract it
          const filesArray = Array.isArray(data) ? data : (data.files || []);
          
          // Filter and transform audio files to Song format
          const audioFiles = filesArray.filter((file: DriveFile) => 
            file.mimeType && (file.mimeType.startsWith('audio/') || file.name.endsWith('.mp3'))
          );
          
          // Transform DriveFile to Song format - using play endpoint with song name
          const transformedSongs: Song[] = audioFiles.map((file: DriveFile) => ({
            id: file.id,
            name: file.name,
            url: `${backendUrl}play/${file.name}` // Use play endpoint with song name
          }));
          
          setSongs(transformedSongs);
        } else {
          setError('Failed to fetch songs');
        }
      } catch (err) {
        setError('Error fetching songs');
        console.error('Error fetching songs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Handle play button click
  const handlePlay = (song: Song) => {
    setCurrentSong(song); // Update the parent's song state
  };

  return (
    <div className="mx-auto bg-gray-800 text-white shadow-lg p-4 space-y-3 w-full h-full overflow-hidden">
      <h2 className="text-lg font-semibold border-b border-gray-600 pb-2">
        🎵 Song List
      </h2>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-200 text-sm">
          {error}
        </div>
      )}
      
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      ) : songs.length > 0 ? (
        <ul className="space-y-2 overflow-y-auto max-h-full">
          {songs.map((song) => (
            <li
              key={song.id}
              className={`flex justify-between items-center px-4 py-2 rounded-lg transition-colors ${
                currentSong?.id === song.id 
                  ? 'bg-pink-600 hover:bg-pink-500' // Highlight currently playing song
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className="text-white truncate block">{song.name}</span>
                {currentSong?.id === song.id && (
                  <span className="text-pink-200 text-xs">Now Playing</span>
                )}
              </div>
              <button
                onClick={() => handlePlay(song)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ml-2 ${
                  currentSong?.id === song.id
                    ? 'bg-white text-pink-600 hover:bg-gray-200'
                    : 'bg-pink-500 hover:bg-pink-400 text-white'
                }`}
              >
                <Play className="w-4 h-4" />
                <span>Play</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-400 text-center py-8">
          No songs found
        </div>
      )}
    </div>
  );
};

export default SongList;