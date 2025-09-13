import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FcGoogle } from "react-icons/fc"; // Google logo

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001/";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";

  useEffect(() => {
    const handleAuthCode = async () => {
      const authCode = searchParams.get('code');
      
      if (authCode) {
        try {
          console.log("HERE IN AUTH");
          console.log(backendUrl);
          const response = await fetch(`${backendUrl}auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: authCode }),
            credentials: 'include'
          });
          
          console.log(response);
          
          if (response.ok) {
            // Redirect to home page after successful authentication
            navigate('/');
          } else {
            console.error('Authentication failed');
            // Optionally handle error state here
          }
        } catch (error) {
          console.error('Error during authentication:', error);
        }
      }
    };

    handleAuthCode();
  }, [searchParams, navigate]);

  const handleLogin = async () => {
    try {
      // Fetch client ID from backend
      const client_id = await fetch(`${backendUrl}auth/clientid`).then(
        (res) => res.text()
      );

      const params = new URLSearchParams({
        client_id: client_id || "YOUR_FALLBACK_CLIENT_ID",
        redirect_uri: window.location.origin + "/login", // Same page redirect
        response_type: "code",
        scope: "https://www.googleapis.com/auth/drive.file openid email",
        access_type: "offline",
        prompt: "consent",
      });

      window.location.href = `${oauth2Endpoint}?${params}`;
    } catch (error) {
      console.error('Error fetching client ID:', error);
    }
  };

  // Show loading state if we have an auth code (processing authentication)
  const authCode = searchParams.get('code');
  if (authCode) {
    return (
      <div className="min-h-screen min-w-full flex items-center justify-center bg-gray-100 p-3">
        <div className="w-[400px] bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Processing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-full flex items-center justify-center bg-gray-100 p-3">
      <div className="w-[400px] bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Welcome</h1>
        <p className="text-gray-600">Login with your Google account</p>
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center space-x-3 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition"
        >
          
          <span className="font-medium text-gray-700">Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};

export default Login;