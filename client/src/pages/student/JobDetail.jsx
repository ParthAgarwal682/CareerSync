import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IndianRupee, Calendar, GraduationCap, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { formatApplicationStatus, roundNodeState } from '../../utils/applicationStatus';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [eligibility, setEligibility] = useState({ status: false, reason: '' });
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [applicationRow, setApplicationRow] = useState(null);
  const [roundProgress, setRoundProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        setApplicationRow(null);
        setRoundProgress([]);

        const jobRes = await api.get(`/jobs/${id}`);
        if (jobRes.data.success) {
          setJob(jobRes.data.job);
        }

        const progRes = await api.get(`/applications/job/${id}/my-progress`);
        if (progRes.data.success && progRes.data.hasApplication) {
          const app = progRes.data.application;
          setApplicationStatus(app.status);
          setApplicationRow(app);
          setRoundProgress(progRes.data.rounds || []);
        } else {
          const appsRes = await api.get('/applications/my');
          if (appsRes.data.success) {
            const appliedJob = appsRes.data.applications.find((app) => app.job_id === parseInt(id, 10));
            if (appliedJob) {
              setApplicationStatus(appliedJob.app_status);
              setApplicationRow(appliedJob);
            } else {
              setApplicationStatus(null);
              setApplicationRow(null);
            }
          }
        }

        if (user && user.student_id) {
          try {
            const eligRes = await api.get(`/jobs/${id}/eligibility/${user.student_id}`);
            if (eligRes.data.success) {
              const statusStr = eligRes.data.status;
              setEligibility({
                status: statusStr === 'Eligible',
                reason: statusStr !== 'Eligible' ? statusStr : '',
              });
            }
          } catch (eligErr) {
            console.warn('Eligibility check failed:', eligErr);
            setEligibility({ status: false, reason: 'Could not verify eligibility' });
          }
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [id, user]);

  const handleApply = async () => {
    try {
      setApplying(true);
      setError('');
      const res = await api.post('/applications', { job_id: parseInt(id) });
      if (res.data.success) {
        setApplicationStatus('Applied');
        try {
          const progRes = await api.get(`/applications/job/${id}/my-progress`);
          if (progRes.data.success && progRes.data.hasApplication) {
            setApplicationRow(progRes.data.application);
            setApplicationStatus(progRes.data.application.status);
            setRoundProgress(progRes.data.rounds || []);
          } else {
            setApplicationRow({ status: 'Applied', app_status: 'Applied' });
            setRoundProgress([]);
          }
        } catch {
          setApplicationRow({ status: 'Applied', app_status: 'Applied' });
          setRoundProgress([]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const roundsForTimeline = useMemo(() => {
    if (!job?.rounds?.length) return [];
    return job.rounds.map((r) => {
      const hit = roundProgress.find((p) => Number(p.round_id) === Number(r.round_id));
      return { ...r, result_status: hit?.result_status ?? null };
    });
  }, [job, roundProgress]);

  const minSeq = useMemo(() => {
    if (!roundsForTimeline.length) return null;
    return Math.min(...roundsForTimeline.map((r) => Number(r.sequence_number)));
  }, [roundsForTimeline]);

  const pipelineLabel = applicationRow ? formatApplicationStatus(applicationRow) : '';

  const nodeClass = (state) => {
    if (state === 'passed') return 'bg-emerald-500 border-2 border-white shadow-sm ring-2 ring-emerald-200/60';
    if (state === 'failed') return 'bg-red-500 border-2 border-white shadow-sm ring-2 ring-red-200/60';
    if (state === 'current') return 'bg-amber-400 border-2 border-white shadow-sm ring-2 ring-amber-300';
    return 'bg-slate-200 border-2 border-white shadow-sm';
  };

  if (loading) return <PageWrapper showBack={false}><div className="flex justify-center items-center h-64"><Loader /></div></PageWrapper>;
  
  if (error && !job) return (
    <PageWrapper showBack={false}>
      <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center">
        <AlertCircle className="w-5 h-5 mr-3" />
        {error}
      </div>
      <Button variant="secondary" className="mt-4" onClick={() => navigate('/student/jobs')}>Go Back</Button>
    </PageWrapper>
  );

  if (!job) return (
    <PageWrapper showBack={false}>
      <div className="bg-slate-50 text-slate-600 p-4 rounded-xl flex items-center">
        <AlertCircle className="w-5 h-5 mr-3" />
        Job not found.
      </div>
      <Button variant="secondary" className="mt-4" onClick={() => navigate('/student/jobs')}>Go Back</Button>
    </PageWrapper>
  );

  const isDeadlinePassed = job.application_deadline
    ? new Date(job.application_deadline) < new Date(new Date().toDateString())
    : false;

  return (
    <PageWrapper showBack={false}>
      <button onClick={() => navigate('/student/jobs')} className="text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 flex items-center">
        ← Back to Jobs
      </button>

      {/* Header Section */}
      <div className="glass-card p-6 md:p-8 mb-8 border-t-4 border-t-primary-600">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-3xl border border-slate-200 mr-6 shadow-sm overflow-hidden">
              {job.logo_url ? (
                <img src={job.logo_url} alt={job.company_name} className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-slate-400">🏢</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{job.role_name}</h1>
              <div className="flex items-center text-slate-500 text-sm">
                <span className="font-medium text-slate-700 mr-2">{job.company_name}</span>
                <span className="mx-2">•</span>
                <span>{job.industry}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <Badge status={job.job_type === 'Full-Time' ? 'Selected' : 'Pending'} customText={job.job_type} />
            <div className="mt-2 text-xl font-bold text-slate-800 flex items-center">
              <IndianRupee className="w-5 h-5 mr-1 text-slate-500" />
              {((job.ctc_or_stipend || 0) / 100000).toFixed(2)} LPA
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Info Grid */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Job Information</h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center">
                   <Calendar className="w-3 h-3 mr-1"/> Visit Date
                </p>
                <p className="font-medium text-slate-800">
                  {job.visit_date ? new Date(job.visit_date).toLocaleDateString() : 'TBD'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center">
                   <Clock className="w-3 h-3 mr-1"/> Apply By
                </p>
                <p className={`font-medium ${isDeadlinePassed ? 'text-red-500' : 'text-slate-800'}`}>
                  {job.application_deadline
                    ? new Date(job.application_deadline).toLocaleDateString()
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center">
                   <GraduationCap className="w-3 h-3 mr-1"/> Required Branches
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {job.branches && job.branches.map(b => (
                     <span key={b} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">{b}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Required Skills</p>
                <p className="text-sm font-medium text-slate-800">{job.required_skills || 'Not specified'}</p>
              </div>
              <div>
                 <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Min CGPA</p>
                 <p className="font-medium text-slate-800">{parseFloat(job.min_cgpa || 0).toFixed(2)}</p>
              </div>
              <div>
                 <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Max Active Backlogs</p>
                 <p className="font-medium text-slate-800">{job.max_backlogs ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Rounds */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">Placement Rounds</h2>
            <p className="text-xs text-slate-500 mb-6">
              Green = cleared, red = failed, amber = your current stage (shortlisted for first OA, or the round you are in).
            </p>
            {job.rounds && job.rounds.length > 0 ? (
              <div className="ml-2 relative border-l-2 border-slate-200 space-y-8 pb-4">
                {roundsForTimeline.map((round) => {
                  const st = applicationRow
                    ? roundNodeState(round, {
                        applicationStatus: applicationRow.status ?? applicationRow.app_status,
                        currentRoundId: applicationRow.current_round_id,
                        minSequence: minSeq,
                      })
                    : 'upcoming';
                  return (
                    <div key={round.round_id} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full z-10 ${nodeClass(st)}`} />
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">{round.round_name}</h3>
                        <p className="text-sm text-slate-500 mt-1">Round {round.sequence_number}</p>
                        {round.result_status && (
                          <p className="text-xs font-medium text-slate-500 mt-1">
                            Result: <span className="text-slate-700">{round.result_status}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
                <p className="text-slate-500 text-sm">No rounds configured for this job yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Action Box */}
        <div className="space-y-6">
          <div className="glass-card p-6 sticky top-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Ready to Apply?</h3>
            
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {applicationStatus ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-lg mb-1">Already Applied</h4>
                <p className="text-sm">
                  Current pipeline:{' '}
                  <strong className="font-semibold block mt-1 text-emerald-900">{pipelineLabel || applicationStatus}</strong>
                </p>
                <Button variant="secondary" className="w-full mt-4" onClick={() => navigate('/student/applications')}>Track Status</Button>
              </div>
            ) : isDeadlinePassed ? (
              <div className="bg-slate-50 text-slate-600 p-4 rounded-xl border border-slate-200 text-center">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="font-bold text-lg mb-1">Deadline Passed</h4>
                <p className="text-sm">This job is no longer accepting applications.</p>
              </div>
            ) : eligibility.status ? (
               <div className="space-y-4">
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100 flex items-center text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-2" /> You are eligible to apply
                  </div>
                  <Button 
                    variant="primary" 
                    className="w-full h-11 text-base" 
                    onClick={handleApply}
                    isLoading={applying}
                  >
                    Confirm Application
                  </Button>
               </div>
            ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-200 text-sm">
                    <div className="font-bold flex items-center mb-1">
                      <AlertCircle className="w-4 h-4 mr-1.5" /> Not Eligible
                    </div>
                    <p className="text-amber-700/80">{eligibility.reason || 'You do not meet the criteria for this job.'}</p>
                  </div>
                  <Button variant="primary" className="w-full h-11" disabled>Apply Now</Button>
               </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default JobDetail;
