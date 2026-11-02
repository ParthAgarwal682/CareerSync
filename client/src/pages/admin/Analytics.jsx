import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import { TrendingUp, Users, Building2, IndianRupee } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import StatsCard from '../../components/common/StatsCard';
import Loader from '../../components/common/Loader';
import api from '../../services/api';

const COLORS = ['#5B58EB', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [branchData, setBranchData] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ovRes, brRes, coRes, timeRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/by-branch'),
          api.get('/analytics/company-selections'),
          api.get('/analytics/timeline')
        ]);

        if (ovRes.data.success) setOverview(ovRes.data.overview);
        if (brRes.data.success) {
          // Format for recharts — match SP field names: branch, total_students, placed, placement_pct
          const formattedBranch = brRes.data.stats.map(s => ({
            name: s.branch,
            Total: s.total_students,
            Placed: s.placed || s.placed_students || 0,
            Percentage: parseFloat(s.placement_pct || s.placement_percentage || 0)
          }));
          setBranchData(formattedBranch);
        }
        if (coRes.data.success) setCompanyData(coRes.data.stats);
        if (timeRes.data.success) {
           const formattedTime = timeRes.data.timeline.map(t => ({
             month: t.month,
             Offers: t.selections
           }));
           setTimelineData(formattedTime);
        }
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <PageWrapper><div className="flex justify-center items-center h-64"><Loader /></div></PageWrapper>;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-glass rounded-lg text-sm">
          <p className="font-bold text-slate-800 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Analytics Dashboard</h1>
        <p className="text-slate-500 mt-2">Deep dive into placement performance metrics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Offers" value={overview?.placed_students || 0} icon={<TrendingUp />} color="emerald" />
        <StatsCard title="Students Registered" value={overview?.total_students || 0} icon={<Users />} color="primary" />
        <StatsCard title="Companies Visited" value={overview?.total_companies || 0} icon={<Building2 />} color="amber" />
        <StatsCard title="Average CTC (LPA)" value={overview?.avg_ctc ? (overview.avg_ctc / 100000).toFixed(2) : 0} icon={<IndianRupee />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Branch Wise Placements */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Placements by Branch</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" />
                <Bar dataKey="Total" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="Placed" fill="#5B58EB" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Companies (Pie Chart) */}
        <div className="glass-card p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Top Recruiting Companies</h2>
          <div className="flex-1 min-h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={companyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="selections"
                  stroke="none"
                >
                  {companyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text for donut */}
            <div className="absolute inset-0 pr-32 pb-4 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-800">{overview?.placed_students || 0}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Selections</span>
            </div>
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Placement Timeline</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Offers" stroke="#10b981" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
};

export default Analytics;
