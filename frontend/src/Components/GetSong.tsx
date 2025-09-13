import { useState } from 'react';

interface GetSongProps {
  onSubmit?: (name: string, url: string) => void; // optional callback
}

const GetSong = ({ onSubmit }: GetSongProps) => {
  const [songName, setSongName] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous messages
    setMessage('');
    setError('');
    
    // Validate inputs
    if (!songName.trim() || !songUrl.trim()) {
      setError('Please fill in both name and URL fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}getfromyt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          name: songName.trim(),
          url: songUrl.trim()
        })
      });

      if (response.ok) {
        const responseText = await response.text();
        setMessage(responseText || 'File uploaded successfully!');
        
        // Call the optional callback if provided
        if (onSubmit) {
          onSubmit(songName.trim(), songUrl.trim());
        }
        
        // Clear the form
        setSongName('');
        setSongUrl('');
      } else {
        const errorText = await response.text();
        setError(errorText || `Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Request failed:', error);
      setError('Failed to upload song. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto h-full bg-gray-800 text-white shadow-lg p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-center">🎶 Get The Song</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="songName" className="text-sm text-gray-300">
            Name
          </label>
          <input
            id="songName"
            type="text"
            placeholder="Enter song name"
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
            disabled={isLoading}
            className="p-2 rounded-lg border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
          />
        </div>

        {/* URL Input */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="songUrl" className="text-sm text-gray-300">
            URL
          </label>
          <input
            id="songUrl"
            type="url"
            placeholder="Enter song URL (YouTube, etc.)"
            value={songUrl}
            onChange={(e) => setSongUrl(e.target.value)}
            disabled={isLoading}
            className="p-2 rounded-lg border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
          />
        </div>

        {/* Success Message */}
        {message && (
          <div className="p-3 bg-green-600 bg-opacity-20 border border-green-500 rounded-lg text-green-300 text-sm">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-600 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={isLoading || !songName.trim() || !songUrl.trim()}
          className="w-full py-2 bg-pink-500 hover:bg-pink-400 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : (
            'Add Song'
          )}
        </button>
      </form>
    </div>
  );
};

export default GetSong;