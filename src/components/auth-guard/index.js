import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for authentication
    const checkAuth = () => {
      const nuptk = localStorage.getItem('nupkt'); // Note: Typo in original code was 'nupkt'
      
      if (!nuptk) {
        // Not logged in, redirect to login
        router.replace('/');
      } else {
        // Logged in, allow access
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
