import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, User, Filter, Edit } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';
import { formatApplicationStatus } from '../../utils/applicationStatus';

const ManageApplications = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialJobId = searchParams.get('job');

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId || '');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobRounds, setJobRounds] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // Only active jobs might be better, but we let admin see all jobs 
        const { data } = await api.get('/jobs?limit=1000');
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

  const fetchAppsForJob = useCallback(async () => {
    if (!selectedJobId) {
      setApplications([]);
      return;
    }
    try {
      setAppsLoading(true);
      const { data } = await api.get(`/applications/job/${selectedJobId}`);
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAppsLoading(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    fetchAppsForJob();
  }, [fetchAppsForJob]);

  useEffect(() => {
    const loadRounds = async () => {
      if (!selectedJobId) {
        setJobRounds([]);
        return;
      }
      try {
        const { data } = await api.get(`/rounds/job/${selectedJobId}`);
        if (data.success) {
          setJobRounds(data.rounds || []);
        }
      } catch (err) {
        console.error(err);
        setJobRounds([]);
      }
    };
    loadRounds();
  }, [selectedJobId]);

  const sortedJobRounds = useMemo(
    () => [...jobRounds].sort((a, b) => a.sequence_number - b.sequence_number),
    [jobRounds]
  );

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const body = { status: newStatus };
      if (newStatus === 'In_Round') {
        const app = applications.find((a) => a.application_id === appId);
        const fallback = sortedJobRounds[0]?.round_id;
        body.current_round_id = app?.current_round_id ?? fallback ?? null;
      }
      const { data } = await api.patch(`/applications/${appId}/status`, body);
      if (data.success) {
        await fetchAppsForJob();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const handleCurrentRoundChange = async (appId, roundId) => {
    try {
      const { data } = await api.patch(`/applications/${appId}/status`, {
        status: 'In_Round',
        current_round_id: parseInt(roundId, 10),
      });
      if (data.success) {
        await fetchAppsForJob();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update round');
    }
  };

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchSearch = app.student_name?.toLowerCase().includes(search.toLowerCase()) || 
                          app.roll_no?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === '' || app.app_status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [applications, search, statusFilter]);

  const statuses = ['Applied', 'Shortlisted', 'In_Round', 'Selected', 'Rejected'];

  const selectedJob = jobs.find(j => j.job_id.toString() === selectedJobId.toString());

  return (
    <PageWrapper>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Review Applications</h1>
          <p className="text-slate-500 mt-2">Manage candidates and update application statuses</p>
        </div>
        
        {/* Job Selector */}
        <div className="mt-4 md:mt-0 w-full md:w-80 relative">
           <select
             className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-700 shadow-sm appearance-none"
             value={selectedJobId}
             onChange={(e) => setSelectedJobId(e.target.value)}
           >
             <option value="">-- Select a Job / Drive --</option>
             {jobs.map(job => (
               <option key={job.job_id} value={job.job_id}>
                 {job.company_name} - {job.role_name}
               </option>
             ))}
           </select>
           <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
             ▼
           </div>
        </div>
      </div>

      {!selectedJobId ? (
        <div className="h-[50vh] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
           <User className="w-16 h-16 text-slate-300 mb-4" />
           <h3 className="text-xl font-bold text-slate-700">No Job Selected</h3>
           <p className="text-slate-500 mt-2 max-w-md text-center">Please select a job drive from the dropdown in the top right to view its applicants.</p>
        </div>
      ) : (
        <div className="glass-card mb-8">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
             <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-bold text-xl text-primary-600 overflow-hidden shrink-0">
                    {selectedJob?.logo_url ? (
                       <img src={selectedJob.logo_url} alt={selectedJob.company_name} className="w-full h-full object-contain p-1" />
                    ) : (
                       selectedJob?.company_name?.charAt(0) || 'C'
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedJob?.company_name}</h2>
                    <p className="text-sm font-medium text-slate-500">{selectedJob?.role_name}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search student..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl border border-slate-200 focus:border-primary-500 outline-none text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="pl-9 pr-8 py-2 w-full sm:w-40 rounded-xl border border-slate-200 focus:border-primary-500 outline-none text-sm appearance-none bg-white"
                    >
                      <option value="">All Statuses</option>
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
             </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {appsLoading ? (
              <div className="p-12"><Loader /></div>
            ) : applications.length === 0 ? (
              <div className="p-12"><EmptyState title="No applications" message="No students have applied for this job yet." /></div>
            ) : filteredApps.length === 0 ? (
               <div className="p-8 text-center text-slate-500">No applicants match your filters.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="px-6 py-4 font-semibold">Student Name</th>
                    <th className="px-6 py-4 font-semibold">Roll No</th>
                    <th className="px-6 py-4 font-semibold">Branch & CGPA</th>
                    <th className="px-6 py-4 font-semibold text-center">Applied On</th>
                    <th className="px-6 py-4 font-semibold text-right">Pipeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredApps.map((app) => (
                    <tr key={app.application_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{app.student_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-600 font-mono text-sm">{app.roll_no}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                           <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-semibold">{app.branch}</span>
                           <span className="font-medium text-slate-700">{app.cgpa} CGPA</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-500">
                         {new Date(app.applied_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="inline-flex flex-col items-end gap-2">
                            <div className="relative inline-block">
                              <select
                                value={app.app_status}
                                onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                              >
                                {statuses.map((s) => (
                                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                ))}
                              </select>
                              <div className="pointer-events-none flex items-center bg-white border border-slate-200 rounded-full pr-2 pl-1 py-1 shadow-sm transition-all hover:bg-slate-50">
                                <div className="mr-2">
                                  <Badge status={app.app_status} customText={formatApplicationStatus(app)} />
                                </div>
                                <Edit className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                            </div>
                            {app.app_status === 'In_Round' && sortedJobRounds.length > 0 && (
                              <select
                                className="text-xs border border-slate-200 rounded-lg px-2 py-1 max-w-[200px]"
                                value={app.current_round_id ?? ''}
                                onChange={(e) => handleCurrentRoundChange(app.application_id, e.target.value)}
                              >
                                {sortedJobRounds.map((r) => (
                                  <option key={r.round_id} value={r.round_id}>
                                    Round {r.sequence_number}: {r.round_name}
                                  </option>
                                ))}
                              </select>
                            )}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default ManageApplications;
