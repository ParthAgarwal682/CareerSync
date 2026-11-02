import React, { useState, useEffect } from 'react';
import { Search, Plus, Briefcase, IndianRupee, MapPin, Edit, Trash2, Calendar, CheckSquare, Zap, Eye, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';

const ALL_BRANCHES = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'MATH'];

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentJob, setCurrentJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [shortlistModalOpen, setShortlistModalOpen] = useState(false);
  const [shortlistJobId, setShortlistJobId] = useState(null);
  const [shortlistLimit, setShortlistLimit] = useState('5');
  const [shortlistSubmitting, setShortlistSubmitting] = useState(false);
  const [shortlistError, setShortlistError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    company_id: '',
    role_name: '',
    job_type: 'Full-Time',
    ctc_or_stipend: '',
    min_cgpa: '',
    max_backlogs: '0',
    required_skills: '',
    visit_date: '',
    application_deadline: '',
    branches: []
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, companiesRes] = await Promise.all([
        api.get(`/jobs${filterType ? `?type=${filterType}` : ''}`),
        api.get('/companies?limit=1000')
      ]);
      
      if (jobsRes.data.success) {
        setJobs(jobsRes.data.jobs);
      }
      if (companiesRes.data.success) {
        setCompanies(companiesRes.data.companies);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType]);

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      company_id: companies.length > 0 ? companies[0].company_id : '',
      role_name: '',
      job_type: 'Full-Time',
      ctc_or_stipend: '',
      min_cgpa: '0.0',
      max_backlogs: '0',
      required_skills: '',
      visit_date: '',
      application_deadline: '',
      branches: []
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = async (job) => {
    setModalMode('edit');
    setCurrentJob(job);
    setError('');
    setIsModalOpen(true); // Open modal early for UX
    
    // Fetch full job details including branches
    try {
      const res = await api.get(`/jobs/${job.job_id}`);
      if (res.data.success) {
        const fullJob = res.data.job;
        setFormData({
          company_id: fullJob.company_id,
          role_name: fullJob.role_name,
          job_type: fullJob.job_type,
          ctc_or_stipend: fullJob.ctc_or_stipend,
          min_cgpa: fullJob.min_cgpa,
          max_backlogs: fullJob.max_backlogs,
          required_skills: fullJob.required_skills || '',
          visit_date: fullJob.visit_date.split('T')[0],
          application_deadline: fullJob.application_deadline.split('T')[0],
          branches: fullJob.branches || []
        });
      }
    } catch (err) {
      setError('Failed to load full job details');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job? This will delete all applications and rounds.')) {
      try {
        await api.delete(`/jobs/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.error?.message || 'Failed to delete job');
      }
    }
  };

  const openShortlistModal = (jobId) => {
    setShortlistJobId(jobId);
    setShortlistLimit('5');
    setShortlistError('');
    setShortlistModalOpen(true);
  };

  const runCompetitiveShortlist = async (e) => {
    e.preventDefault();
    const n = parseInt(shortlistLimit, 10);
    if (!Number.isFinite(n) || n < 1) {
      setShortlistError('Enter a positive number (how many Applied students to shortlist).');
      return;
    }
    setShortlistSubmitting(true);
    setShortlistError('');
    try {
      const res = await api.post(`/jobs/${shortlistJobId}/shortlist`, { limit: n });
      alert(res.data.message);
      setShortlistModalOpen(false);
      fetchData();
    } catch (err) {
      setShortlistError(err.response?.data?.error?.message || 'Failed to run shortlist');
    } finally {
      setShortlistSubmitting(false);
    }
  };

  const toggleBranch = (branchStr) => {
    setFormData(prev => {
      const current = prev.branches;
      if (current.includes(branchStr)) {
        return { ...prev, branches: current.filter(b => b !== branchStr) };
      } else {
        return { ...prev, branches: [...current, branchStr] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.branches.length === 0) {
      setError('Please select at least one eligible branch.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...formData,
        ctc_or_stipend: parseInt(formData.ctc_or_stipend),
        min_cgpa: parseFloat(formData.min_cgpa),
        max_backlogs: parseInt(formData.max_backlogs)
      };

      if (modalMode === 'add') {
        await api.post('/jobs', payload);
      } else {
        await api.put(`/jobs/${currentJob.job_id}`, payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save job');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter local search string
  const filteredJobs = jobs.filter(job => 
    job.company_name.toLowerCase().includes(search.toLowerCase()) || 
    job.role_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Manage Jobs</h1>
          <p className="text-slate-500 mt-2">Post new opportunities and manage shortlists</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={openAddModal}>
          Post New Job
        </Button>
      </div>

      <div className="glass-card mb-8">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
          <select 
            className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-primary-500 bg-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12"><Loader /></div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-8"><EmptyState title="No jobs found" message="Post a new job to start receiving applications." /></div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-white text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4 font-semibold">Role & Company</th>
                  <th className="px-6 py-4 font-semibold">Compensation</th>
                  <th className="px-6 py-4 font-semibold">Deadline</th>
                  <th className="px-6 py-4 font-semibold text-center">Applicants</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredJobs.map((job) => (
                  <tr key={job.job_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-base">{job.role_name}</div>
                      <div className="text-sm text-slate-500 flex items-center mt-1">
                        <Briefcase className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {job.company_name}
                        <span className="mx-2 text-slate-300">•</span>
                        <Badge status={job.job_type === 'Full-Time' ? 'Selected' : 'Pending'} customText={job.job_type} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-800 flex items-center">
                        <IndianRupee className="w-3.5 h-3.5 mr-1" />
                        {(job.ctc_or_stipend / 100000).toFixed(2)} LPA
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 flex items-center">
                         <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                         {new Date(job.application_deadline).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge status="Applied" customText={`${job.applicants_count} Applied`} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-wrap gap-1 justify-end">
                       <button title="Competitive shortlist (top N by CGPA)" onClick={() => openShortlistModal(job.job_id)} className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors">
                         <Zap className="w-4 h-4" />
                       </button>
                       <button title="Review applications" onClick={() => navigate(`/admin/applications?job=${job.job_id}`)} className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                         <CheckSquare className="w-4 h-4" />
                       </button>
                       <button title="Configure rounds for this job" onClick={() => navigate(`/admin/rounds?job=${job.job_id}`)} className="p-2 text-violet-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors">
                         <Layers className="w-4 h-4" />
                       </button>
                       <button title="Edit Job" onClick={() => openEditModal(job)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                         <Edit className="w-4 h-4" />
                       </button>
                       <button title="Delete Job" onClick={() => handleDelete(job.job_id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                         <Trash2 className="w-4 h-4" />
                       </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={shortlistModalOpen}
        onClose={() => setShortlistModalOpen(false)}
        title="Competitive shortlist"
      >
        <form onSubmit={runCompetitiveShortlist} className="space-y-4">
          <p className="text-sm text-slate-600">
            From students currently in <strong>Applied</strong> status, the top <strong>N</strong> are moved to{' '}
            <strong>Shortlisted</strong> (highest CGPA first, then fewest active backlogs, then earliest application).
            All other Applied candidates for this job are set to <strong>Rejected</strong>.
          </p>
          {shortlistError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{shortlistError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Number to shortlist (N)</label>
            <input
              type="number"
              min={1}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              value={shortlistLimit}
              onChange={(e) => setShortlistLimit(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShortlistModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={shortlistSubmitting}>
              Run shortlist
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Post New Job' : 'Edit Job'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
            <select 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
              value={formData.company_id}
              onChange={e => setFormData({...formData, company_id: e.target.value})}
            >
              <option value="" disabled>Select Company</option>
              {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.name}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Software Development Engineer"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.role_name}
              onChange={e => setFormData({...formData, role_name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                value={formData.job_type}
                onChange={e => setFormData({...formData, job_type: e.target.value})}
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Compensation (INR)</label>
              <input 
                type="number" 
                required
                placeholder="e.g. 1500000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.ctc_or_stipend}
                onChange={e => setFormData({...formData, ctc_or_stipend: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min CGPA</label>
              <input 
                type="number" 
                step="0.01"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.min_cgpa}
                onChange={e => setFormData({...formData, min_cgpa: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Active Backlogs</label>
              <input 
                type="number" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.max_backlogs}
                onChange={e => setFormData({...formData, max_backlogs: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Visit Date</label>
              <input 
                type="date" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.visit_date}
                onChange={e => setFormData({...formData, visit_date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apply By (Deadline)</label>
              <input 
                type="date" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.application_deadline}
                onChange={e => setFormData({...formData, application_deadline: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Eligible Branches</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ALL_BRANCHES.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBranch(b)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    formData.branches.includes(b) 
                      ? 'bg-primary-50 text-primary-700 border-primary-200' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Required Skills</label>
            <textarea 
              rows="2"
              placeholder="e.g. C++, Java, System Design..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              value={formData.required_skills}
              onChange={e => setFormData({...formData, required_skills: e.target.value})}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-6 shrink-0">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
            <Button variant="primary" type="submit" isLoading={submitting}>
              {modalMode === 'add' ? 'Post Job' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

    </PageWrapper>
  );
};

export default ManageJobs;
