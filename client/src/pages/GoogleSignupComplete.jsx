import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, BookOpen, ShieldCheck, ArrowRight, ServerCrash, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import api from '../services/api';

const GoogleSignupComplete = () => {
  const [searchParams] = useSearchParams();
  const googleEmail = searchParams.get('email') || '';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    roll_no: '',
    branch: 'CSE',
    graduation_year: '2028',
    cgpa: '',
    active_backlogs: '0'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/google/complete-signup', {
        email: googleEmail,
        ...formData
      });

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        window.location.href = '/student'; // Full reload to refresh auth context
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to complete signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="glass-card p-8">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Almost There!</h2>
            <p className="text-slate-500 text-sm">Complete your profile to finish signing up</p>
          </div>

          {/* Google Email (read-only) */}
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500 mr-3" />
            <span className="text-slate-500 mr-1">Signing up as:</span>
            <span className="font-semibold text-slate-800">{googleEmail}</span>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center">
              <ServerCrash className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Details */}
            <div>
              <div className="flex items-center text-[10px] font-bold tracking-widest text-primary-600 uppercase mb-3">
                <User className="w-3 h-3 mr-2" />
                Personal Details
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                    placeholder="Om Tiwari"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Roll Number</label>
                  <input type="text" name="roll_no" value={formData.roll_no} onChange={handleChange} required
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm uppercase"
                    placeholder="2241011001"
                  />
                </div>
              </div>
            </div>

            {/* Academic Details */}
            <div>
              <div className="flex items-center text-[10px] font-bold tracking-widest text-primary-600 uppercase mb-3">
                <BookOpen className="w-3 h-3 mr-2" />
                Academic Details
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Branch</label>
                  <select name="branch" value={formData.branch} onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm appearance-none bg-white"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">ME</option>
                    <option value="MATH">MATH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Graduation Year</label>
                  <select name="graduation_year" value={formData.graduation_year} onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm appearance-none bg-white"
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">CGPA</label>
                  <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange} required
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                    placeholder="9.00" min="0" max="10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Active Backlogs</label>
                  <input type="number" name="active_backlogs" value={formData.active_backlogs} onChange={handleChange} required
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                    placeholder="0" min="0"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Button type="submit" className="w-full justify-between" size="lg" isLoading={loading}>
                <span>Complete Registration</span>
                {!loading && <ArrowRight className="w-5 h-5" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignupComplete;
