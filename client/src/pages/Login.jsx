import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ServerCrash, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'google_auth_failed') setError('Google Authentication Failed. Please try again.');
    if (err === 'google_not_configured') setError('Google OAuth is not configured. Please login with your SNU email and password until the administrator completes setup.');
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      const from = location.state?.from?.pathname;
      const actualRole = result.user?.role;
      const fromMatchesRole =
        from &&
        ((actualRole === 'Admin' && from.startsWith('/admin')) ||
          (actualRole === 'Student' && from.startsWith('/student')));
      if (fromMatchesRole) {
        navigate(from, { replace: true });
      } else if (actualRole === 'Admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background font-sans">
      
      {/* Left Side: Branding (Hidden on Mobile) */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-white border-r border-slate-100">
        <div>
          <div className="flex items-center space-x-2 mb-16">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">C</div>
            <span className="font-bold text-xl tracking-tight text-slate-800">CareerSync</span>
          </div>
          <h1 className="text-5xl font-bold text-slate-800 leading-tight mb-6 tracking-tight">
            Charting the Future of <br/>
            <span className="text-primary-600">Placement Excellence.</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-md">
            Explore opportunities, manage applications, and stay on track throughout your placement journey.
          </p>
        </div>
        
        <div className="w-full mt-12 flex items-center justify-center relative">
           <img src="https://res.cloudinary.com/dionysus2359/image/upload/v1776511754/image_used_in_student_login_and_signup_page_hqheys.jpg" alt="Illustration" className="w-full max-w-sm mix-blend-multiply" />
        </div>
        
        <p className="text-xs text-slate-400 mt-8">© 2026 CAREERSYNC. ALL RIGHTS RESERVED.</p>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex items-center justify-center p-6 relative">
        <Link to="/" className="absolute top-6 right-6 flex items-center px-4 py-2 text-sm text-slate-500 hover:text-primary-600 font-medium bg-slate-50 hover:bg-primary-50 rounded-full transition-all">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="w-full max-w-md animate-fade-in">
          <div className="glass-card p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
              <p className="text-slate-500 text-sm">Login to continue your placement journey</p>
            </div>

            {/* Role Toggle */}
            <div className="flex p-1 bg-slate-50 rounded-xl mb-6 border border-slate-100">
              <button
                type="button"
                onClick={() => setRole('Student')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  role === 'Student' 
                    ? 'bg-white text-primary-600 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('Admin')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  role === 'Admin' 
                    ? 'bg-white text-primary-600 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Administrator
              </button>
            </div>

            {/* Google Login */}
            {role === 'Student' && (
              <>
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium text-slate-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <div className="relative mb-5">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                  <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-slate-400">or</span></div>
                </div>
              </>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center">
                <ServerCrash className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    placeholder="yourname@snu.edu.in"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Password
                  </label>
                  <a href="#" className="text-xs text-primary-600 hover:text-primary-800 font-medium tracking-tight">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full justify-between" 
                  size="lg"
                  isLoading={loading}
                >
                  <span>Login</span>
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </Button>
              </div>
            </form>

            {role === 'Student' && (
              <div className="mt-8 text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary-600 font-semibold hover:text-primary-800">
                  Sign Up
                </Link>
              </div>
            )}
            {role === 'Admin' && (
              <div className="mt-8 text-center text-sm text-red-500 bg-red-50 py-3 px-4 rounded-xl border border-red-100 font-medium">
                Restricted access. Use your official credentials.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
