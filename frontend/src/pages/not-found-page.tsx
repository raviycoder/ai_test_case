import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleRedirect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-md mx-4">
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
          <p className="text-gray-500 mb-6">
            Oops! The page you're looking for doesn't exist.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => handleRedirect('/')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
          >
            Go to Home
          </button>
          
          <button
            onClick={() => handleRedirect('/home')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
          >
            Go to Dashboard
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          Redirecting to home in <span className="font-bold text-blue-500">{countdown}</span> seconds
        </div>
      </div>
    </div>
  );
};

export default NotFound;