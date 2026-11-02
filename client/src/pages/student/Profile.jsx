import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, GraduationCap, FileText, CheckCircle, AlertCircle, Save, Camera } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Editable fields
  const [cgpa, setCgpa] = useState('');
  const [backlogs, setBacklogs] = useState('');
  const [resumeLink, setResumeLink] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (user?.student_id) {
          const res = await api.get(`/students/${user.student_id}`);
          if (res.data.success) {
            const data = res.data.student;
            setProfile(data);
            setCgpa(data.cgpa || '');
            setBacklogs(data.active_backlogs || 0);
            setResumeLink(data.resume_link || '');
          }
        }
      } catch (err) {
        setError('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const payload = {
        cgpa: parseFloat(cgpa),
        active_backlogs: parseInt(backlogs, 10),
        resume_link: resumeLink
      };

      const res = await api.put(`/students/${user.student_id}`, payload);
      if (res.data.success) {
        setSuccess('Profile updated successfully!');
        setProfile(prev => ({ ...prev, ...payload }));
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      setUploading(true);
      setError('');
      const res = await api.post('/upload/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setProfile(prev => ({ ...prev, profile_picture: res.data.url }));
        setSuccess('Profile picture updated!');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <PageWrapper><div className="flex justify-center items-center h-64"><Loader /></div></PageWrapper>;

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Profile</h1>
        <p className="text-slate-500 mt-2">Manage your academic details and resume</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center border border-red-100">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center border border-emerald-100">
          <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Read-only Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass-card p-8 flex flex-col items-center text-center">
            {/* Profile Picture */}
            <div className="relative group mb-4">
              {profile?.profile_picture ? (
                <img 
                  src={profile.profile_picture} 
                  alt={profile.name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white shadow-sm">
                  {profile?.name?.charAt(0) || 'U'}
                </div>
              )}
              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 w-24 h-24 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleProfilePicUpload}
                className="hidden"
              />
            </div>

            <h2 className="text-xl font-bold text-slate-900">{profile?.name}</h2>
            <p className="text-slate-500 text-sm mb-4">{user?.email}</p>
            
            <Badge status={profile?.placement_status === 'Placed' ? 'Selected' : 'Pending'}>
              {profile?.placement_status || 'Unplaced'}
            </Badge>

            <div className="w-full mt-8 space-y-4 text-left">
              <div className="flex items-center text-sm text-slate-600 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 mr-3 text-slate-400" />
                <span className="w-24 text-slate-400 font-medium tracking-wide uppercase text-xs">Roll No</span>
                <span className="font-semibold text-slate-800">{profile?.roll_no}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600 border-b border-slate-100 pb-3">
                <GraduationCap className="w-4 h-4 mr-3 text-slate-400" />
                <span className="w-24 text-slate-400 font-medium tracking-wide uppercase text-xs">Branch</span>
                <span className="font-semibold text-slate-800">{profile?.branch}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600 pb-1">
                <User className="w-4 h-4 mr-3 text-slate-400" />
                <span className="w-24 text-slate-400 font-medium tracking-wide uppercase text-xs">Grad Year</span>
                <span className="font-semibold text-slate-800">{profile?.graduation_year}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Editable Form */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Academic & Resume Details</h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* CGPA & Backlogs Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current CGPA</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="10" 
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1.5">Out of 10.0</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Active Backlogs</label>
                  <input 
                    type="number" 
                    min="0" 
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    value={backlogs}
                    onChange={(e) => setBacklogs(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1.5">Enter 0 if none</p>
                </div>
              </div>

              {/* Resume Link */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Resume Link (URL)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    type="url" 
                    placeholder="https://drive.google.com/... or portfolio link"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    value={resumeLink}
                    onChange={(e) => setResumeLink(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">Ensure the link is publicly accessible to recruiters.</p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <Button 
                  type="submit" 
                  variant="primary" 
                  icon={<Save className="w-4 h-4" />}
                  isLoading={saving}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
};

export default Profile;
