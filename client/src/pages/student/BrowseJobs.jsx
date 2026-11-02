import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, DollarSign, Calendar, Eye } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const BrowseJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/jobs');
        if (data.success) {
          setJobs(data.jobs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.company_name.toLowerCase().includes(search.toLowerCase()) || 
    job.role_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Browse Openings</h1>
        <p className="text-slate-500 mt-2">Find and apply to the best campus opportunities.</p>
      </div>

      <div className="mb-8 flex">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : filteredJobs.length === 0 ? (
        <EmptyState title="No active jobs" message="There are no jobs currently matching your search criteria." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map(job => (
            <div key={job.job_id} className="glass-card p-6 flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                    {job.logo_url ? (
                      <img src={job.logo_url} alt={job.company_name} className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <span className="text-2xl font-bold text-slate-400">{job.company_name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{job.role_name}</h3>
                    <p className="text-slate-500 font-medium">{job.company_name}</p>
                  </div>
                </div>
                {/* Could add a 'Match' percentage here if we had ML */}
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 mt-2">
                <div className="flex items-center text-sm text-slate-600">
                  <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
                  {(job.ctc_or_stipend / 100000).toFixed(2)} LPA
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                  {job.job_type}
                </div>
                <div className="flex items-center text-sm text-red-500 col-span-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end">
                <Button variant="secondary" icon={<Eye className="w-4 h-4" />} onClick={() => navigate(`/student/jobs/${job.job_id}`)}>
                  View Details & Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default BrowseJobs;
