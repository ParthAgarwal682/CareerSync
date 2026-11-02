import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Hash, GraduationCap, ServerCrash, BookOpen, ShieldCheck, ArrowRight, ArrowLeft, Check, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PasswordStrengthBar = ({ password }) => {
  const checks = useMemo(() => ({
    length: password.length >= 6,
    digit: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }), [password]);

  const score = Object.values(checks).filter(Boolean).length;
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-400'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score] : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className={`text-[10px] font-semibold ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-amber-500' : 'text-emerald-500'}`}>
        {labels[score]}
      </p>
      {/* Requirements checklist */}
      <div className="space-y-0.5">
        {[
          { key: 'length', label: 'At least 6 characters' },
          { key: 'digit', label: 'Contains a digit (0-9)' },
          { key: 'special', label: 'Contains a special character' },
        ].map(({ key, label }) => (
          <div key={key} className={`flex items-center text-[10px] gap-1.5 ${checks[key] ? 'text-emerald-600' : 'text-slate-400'}`}>
            {checks[key] ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    roll_no: '',
    branch: 'CSE',
    graduation_year: '2028',
    cgpa: '',
    active_backlogs: '0'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const emailError = useMemo(() => {
    if (!formData.email) return '';
    if (!formData.email.endsWith('@snu.edu.in')) return 'Must be a @snu.edu.in email';
    return '';
  }, [formData.email]);

  const passwordValid = useMemo(() => {
    const p = formData.password;
    return p.length >= 6 && /[0-9]/.test(p) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p);
  }, [formData.password]);

  const passwordsMatch = formData.password && formData.confirm_password && formData.password === formData.confirm_password;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (emailError) return setError(emailError);
    if (!passwordValid) return setError('Password does not meet requirements.');
    if (formData.password !== formData.confirm_password) return setError('Passwords do not match.');

    setLoading(true);
    const result = await signup(formData);
    
    if (result.success) {
      navigate('/student', { replace: true });
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleGoogleSignup = () => {
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

      {/* Right Side: Signup Form */}
      <div className="flex items-center justify-center p-4 relative overflow-y-auto max-h-screen">
        <Link to="/" className="absolute top-6 right-6 flex items-center px-4 py-2 text-sm text-slate-500 hover:text-primary-600 font-medium bg-slate-50 hover:bg-primary-50 rounded-full transition-all z-10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <div className="w-full max-w-md animate-fade-in my-auto transform scale-95 md:scale-100">
          <div className="glass-card p-6 md:p-8">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome</h2>
              <p className="text-slate-500 text-xs">Sign up to continue your placement journey</p>
            </div>

            {/* Google Sign Up */}
            <button
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium text-slate-700"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-slate-400">or sign up with email</span></div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-center">
                <ServerCrash className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              
              {/* Personal Details */}
              <div>
                <div className="flex items-center text-[10px] font-bold tracking-widest text-primary-600 uppercase mb-2">
                  <User className="w-3 h-3 mr-2" />
                  Personal Details
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase mb-1">Full Name</label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange} required
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                      placeholder="Om Tiwari"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase mb-1">Roll Number</label>
                    <input
                      type="text" name="roll_no" value={formData.roll_no} onChange={handleChange} required
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm uppercase"
                      placeholder="2241011001"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase mb-1">Branch</label>
                    <select
                      name="branch" value={formData.branch} onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-[13px] appearance-none bg-white"
                    >
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="ME">ME</option>
                      <option value="MATH">MATH</option>
                      <option value="CIVIL">CIVIL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase mb-1">Graduation Year</label>
                    <select
                      name="graduation_year" value={formData.graduation_year} onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm appearance-none bg-white"
                    >
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                      <option value="2029">2029</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className="pt-1">
                <div className="flex items-center text-[10px] font-bold tracking-widest text-primary-600 uppercase mb-2">
                  <BookOpen className="w-3 h-3 mr-2" />
                  Academic Details
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase mb-1">CGPA</label>
                    <input
                      type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange} required
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                      placeholder="9.00" min="0" max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase mb-1">Backlogs</label>
                    <input
                      type="number" name="active_backlogs" value={formData.active_backlogs} onChange={handleChange} required
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                      placeholder="0" min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div className="pt-1">
                <div className="flex items-center text-[10px] font-bold tracking-widest text-primary-600 uppercase mb-2">
                  <ShieldCheck className="w-3 h-3 mr-2" />
                  Account Security
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email" name="email" value={formData.email} onChange={handleChange} required
                        className={`w-full pl-9 pr-3 py-2 rounded-lg border ${emailError && formData.email ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-100'} outline-none transition-all text-[13px]`}
                        placeholder="yourname@snu.edu.in"
                      />
                    </div>
                    {emailError && formData.email && (
                      <p className="text-[10px] text-red-500 mt-1 font-medium">{emailError}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase mb-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                          className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-[13px]"
                          placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <PasswordStrengthBar password={formData.password} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase mb-1">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required
                          className={`w-full pl-9 pr-3 py-2 rounded-lg border ${formData.confirm_password && !passwordsMatch ? 'border-red-300' : 'border-slate-200'} focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-[13px]`}
                          placeholder="••••••••"
                        />
                      </div>
                      {formData.confirm_password && !passwordsMatch && (
                        <p className="text-[10px] text-red-500 mt-1 font-medium">Passwords don't match</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <Button type="submit" className="w-full justify-between" size="md" isLoading={loading}
                  disabled={!passwordValid || !!emailError || !passwordsMatch}
                >
                  <span>Create Account</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </form>

            <div className="mt-4 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-800">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
