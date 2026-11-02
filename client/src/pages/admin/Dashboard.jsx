import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Briefcase, GraduationCap, IndianRupee, ArrowRight, TrendingUp } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import StatsCard from '../../components/common/StatsCard';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import api from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const { data } = await api.get('/analytics/overview');
        if (data.success) {
          setStats(data.overview);
        }
      } catch (err) {
        console.error('Failed to load overview', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) return <PageWrapper><div className="flex justify-center items-center h-64"><Loader /></div></PageWrapper>;

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">CareerSync Admin Dashboard</h1>
        <p className="text-slate-500 mt-2">Overview of the current placement season</p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Students" 
          value={stats?.total_students || 0} 
          icon={<Users />} 
          color="primary"
        />
        <StatsCard 
          title="Placed Students" 
          value={stats?.placed_students || 0} 
          subtitle={`${stats?.total_students ? Math.round((stats.placed_students / stats.total_students) * 100) : 0}% Placement Rate`}
          icon={<GraduationCap />} 
          color="emerald"
        />
        <StatsCard 
          title="Active Drives" 
          value={stats?.total_jobs || 0} 
          icon={<Briefcase />} 
          color="amber"
        />
        <StatsCard 
          title="Avg CTC" 
          value={`${stats?.avg_ctc ? (stats.avg_ctc / 100000).toFixed(2) : '0'} LPA`} 
          icon={<IndianRupee />} 
          color="purple"
        />
      </div>

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Management Links */}
        <div className="glass-card p-6 md:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-primary-600" />
            Quick Management
          </h2>
          <div className="space-y-4">
            <button onClick={() => navigate('/admin/companies')} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all group">
              <div className="flex items-center text-slate-700 font-medium group-hover:text-primary-700">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mr-3 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">🏢</div>
                Manage Companies
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
            </button>
            <button onClick={() => navigate('/admin/jobs')} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all group">
              <div className="flex items-center text-slate-700 font-medium group-hover:text-primary-700">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mr-3 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">💼</div>
                Post & Manage Jobs
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
            </button>
            <button onClick={() => navigate('/admin/students')} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all group">
              <div className="flex items-center text-slate-700 font-medium group-hover:text-primary-700">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mr-3 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">🎓</div>
                Student Directory
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        {/* Data & Analytics Teaser */}
        <div className="glass-card p-6 md:p-8 bg-gradient-to-br from-indigo-900 to-[#4843d1] text-white overflow-hidden relative">
           {/* Decorative background circle */}
           <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
           <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
           
           <div className="relative z-10 flex flex-col h-full">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 border border-white/20">
               <TrendingUp className="w-6 h-6 text-white" />
             </div>
             <h2 className="text-2xl font-bold mb-2">Deep Insights</h2>
             <p className="text-indigo-100 mb-8 opacity-90 leading-relaxed">
               View comprehensive analytics, track placement trends across branches, and analyze company hiring patterns.
             </p>
             <div className="mt-auto">
               <button 
                 onClick={() => navigate('/admin/analytics')} 
                 className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl bg-white text-[#4843d1] hover:bg-slate-100 shadow-lg transition-all w-full md:w-auto"
               >
                 Open Analytics Dashboard <ArrowRight className="w-4 h-4 ml-2" />
               </button>
             </div>
           </div>
        </div>

      </div>
    </PageWrapper>
  );
};

export default AdminDashboard;
