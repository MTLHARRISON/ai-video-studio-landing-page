import { Link } from 'react-router-dom';
import { Flag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white">
      <div className="max-w-3xl text-center p-8">
        <div className="mb-6">
          <Flag className="w-12 h-12 mx-auto text-red-500" />
        </div>
        <h1 className="text-9xl font-black tracking-tight">404</h1>
        <h2 className="text-2xl sm:text-3xl mt-4 font-bold">Page Not Found</h2>
        <p className="mt-4 text-white/70">Looks like you took the wrong line into the gravel. The page you're looking for doesn't exist.</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to="/" className="px-5 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold">Back to home</Link>
          <a href="https://www.formula1.com" target="_blank" rel="noopener noreferrer" className="px-5 py-3 border border-white/10 rounded-lg text-sm">Official F1 site</a>
        </div>
      </div>
    </div>
  );
}
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
