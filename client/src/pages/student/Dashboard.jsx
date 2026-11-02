import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle, Clock } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import StatsCard from '../../components/common/StatsCard';
import Badge from '../../components/common/Badge';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { formatApplicationStatus } from '../../utils/applicationStatus';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ applied: 0, inRound: 0, selected: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/applications/my');
        if (data.success) {
          setApplications(data.applications.slice(0, 5)); // Last 5 applications
          
          let selected = 0;
          let inRound = 0;
          const inProgress = (s) =>
            s &&
            !['Applied', 'Rejected'].includes(s) &&
            s !== 'Selected';
          data.applications.forEach((app) => {
            if (app.app_status === 'Selected') selected++;
            else if (inProgress(app.app_status)) inRound++;
          });
          
          setStats({
            applied: data.applications.length,
            inRound,
            selected
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome back, {user?.profile?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 mt-2">Track your placement journey and stay updated with new opportunities</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Applied" 
          value={stats.applied} 
          icon={<Briefcase />} 
          color="primary"
        />
        <StatsCard 
          title="In Round" 
          value={stats.inRound} 
          icon={<Clock />} 
          color="amber"
        />
        <StatsCard 
          title="Selected" 
          value={stats.selected} 
          icon={<CheckCircle />} 
          color="emerald"
        />
      </div>

      {/* Active Applications */}
      <div className="glass-card mb-8">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">Recent Applications</h2>
          <Link
            to="/student/applications"
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-semibold">Company</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length > 0 ? applications.map((app) => (
                <tr key={app.application_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center mr-4 text-xl overflow-hidden shrink-0">
                      {app.logo_url ? (
                        <img src={app.logo_url} alt={app.company_name} className="w-full h-full object-contain p-1" />
                      ) : (
                        app.company_name.charAt(0)
                      )}
                    </div>
                    {app.company_name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{app.role_name}</td>
                  <td className="px-6 py-4 text-right">
                    <Badge status={app.app_status} customText={formatApplicationStatus(app)} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-slate-500">No applications found. Time to apply!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
};

export default StudentDashboard;
