import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Player from "./Components/Player";
import SongList from "./Components/SongList";
import GetSong from "./Components/GetSong";
import Login from "./Components/Login";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001/";
// Song interface to match both components
interface Song {
  id: string;
  name: string;
  url: string;
}

function Home() {
  // Shared song state
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  return (
    <div className="App border-2 border-black">
      <div className="flex h-full">
        {/* Pass current song state to Player */}
        <Player currentSong={currentSong} />
        <div className="bg-yellow-300 w-[25%] flex flex-col ">
          {/* Pass both current song and setter to SongList */}
          <div className='h-[60%]'>
            <SongList currentSong={currentSong} setCurrentSong={setCurrentSong} />
          </div>

          <div className='h-[40%]'>
            <GetSong />
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRefreshToken = async () => {
      try {
        // First, check if login ID exists in cookie
        const checkResponse = await fetch(`${backendUrl}auth/checkLogin`, {
          method: 'GET',
          credentials: 'include', // Include cookies in the request
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        const checkData = await checkResponse.json();
        console.log(checkData);

        if (checkData.flag1 && !checkData.flag2) {
          // If ID exists, refresh the token
          const refreshResponse = await fetch(`${backendUrl}/auth/refresh`, {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
          });

          if (refreshResponse.ok) {
            // Token refreshed successfully
            setIsAuthenticated(true);
          } else {
            // Failed to refresh token
            setIsAuthenticated(false);
          }
        }else if(checkData.flag2){
          const response = await fetch(`${backendUrl}auth/refresh`, {
            method:'GET',
            credentials :'include'
          })
          console.log(response);
          setIsAuthenticated(true);
        } 
        else {
          // No ID in cookie
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRefreshToken();
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;