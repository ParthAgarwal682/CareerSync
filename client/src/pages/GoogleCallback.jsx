import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loader from '../components/common/Loader';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');

    if (token) {
      localStorage.setItem('token', token);
      // Full page reload to refresh auth context
      window.location.href = role === 'Admin' ? '/admin' : '/student';
    } else {
      navigate('/login?error=google_auth_failed');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader />
        <p className="mt-4 text-slate-500 text-sm">Authenticating with Google...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
