import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers, Plus, Search, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';

const ManageRounds = () => {
  const [searchParams] = useSearchParams();
  const jobFromUrl = searchParams.get('job');
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [rounds, setRounds] = useState([]);
  const [results, setResults] = useState({}); // mapping roundId -> results[]
  
  const [loading, setLoading] = useState(true);
  const [roundsLoading, setRoundsLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentRound, setCurrentRound] = useState(null);
  const [formData, setFormData] = useState({ round_name: '', sequence_number: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Result Modal State
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [activeRound, setActiveRound] = useState(null);
  const [applications, setApplications] = useState([]); // Needed to show who can be graded
  const [resultForm, setResultForm] = useState({ application_id: '', status: 'Pass', remarks: '' });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/jobs?limit=1000');
        if (data.success) {
          setJobs(data.jobs);
          if (jobFromUrl && data.jobs.some((j) => j.job_id.toString() === jobFromUrl)) {
            setSelectedJobId(jobFromUrl);
          } else if (data.jobs.length > 0) {
            setSelectedJobId(data.jobs[0].job_id.toString());
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [jobFromUrl]);

  const fetchRoundsAndResults = async () => {
    if (!selectedJobId) return;
    try {
      setRoundsLoading(true);
      const res = await api.get(`/rounds/job/${selectedJobId}`);
      if (res.data.success) {
        setRounds(res.data.rounds);
        
        // Fetch results for each round
        const resultsMap = {};
        for (let round of res.data.rounds) {
          const rr = await api.get(`/rounds/${round.round_id}/results`);
          if (rr.data.success) {
            resultsMap[round.round_id] = rr.data.results;
          }
        }
        setResults(resultsMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRoundsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoundsAndResults();
  }, [selectedJobId]);

  const openAddModal = () => {
    setModalMode('add');
    // auto-increment sequence based on existing rounds
    const nextSeq = rounds.length > 0 ? Math.max(...rounds.map(r => r.sequence_number)) + 1 : 1;
    setFormData({ round_name: '', sequence_number: nextSeq });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (round) => {
    setModalMode('edit');
    setCurrentRound(round);
    setFormData({ round_name: round.round_name, sequence_number: round.sequence_number });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this round and all its results?')) {
      try {
        await api.delete(`/rounds/${id}`);
        fetchRoundsAndResults();
      } catch (err) {
        alert('Failed to delete round');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = { ...formData, sequence_number: parseInt(formData.sequence_number) };
      if (modalMode === 'add') {
        payload.job_id = parseInt(selectedJobId);
        await api.post('/rounds', payload);
      } else {
        await api.put(`/rounds/${currentRound.round_id}`, payload);
      }
      setIsModalOpen(false);
      fetchRoundsAndResults();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save round');
    } finally {
      setSubmitting(false);
    }
  };

  const openResultModal = async (round) => {
    setActiveRound(round);
    setResultForm({ application_id: '', status: 'Cleared', remarks: '' });
    setError('');
    
    // We need to fetch the applicants for this job so the admin can pick who to grade.
    try {
      const res = await api.get(`/applications/job/${selectedJobId}`);
      if (res.data.success) {
        // Students in the shortlist pipeline or actively sitting a round
        const gradeable = ['Shortlisted', 'In_Round'];
        const eligible = res.data.applications.filter((a) => gradeable.includes(a.app_status));
        setApplications(eligible);
        if (eligible.length > 0) {
          setResultForm(prev => ({ ...prev, application_id: eligible[0].application_id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
    
    setIsResultModalOpen(true);
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/rounds/${activeRound.round_id}/results`, {
        application_id: parseInt(resultForm.application_id),
        status: resultForm.status,
        remarks: resultForm.remarks
      });
      setIsResultModalOpen(false);
      fetchRoundsAndResults(); // refresh table
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit result');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedJob = jobs.find(j => j.job_id.toString() === selectedJobId);

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Evaluate Rounds</h1>
          <p className="text-slate-500 mt-2">Configure interview rounds and record outcomes</p>
        </div>
        
        <div className="w-full md:w-80 relative">
           <select
             className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-700 shadow-sm appearance-none"
             value={selectedJobId}
             onChange={(e) => setSelectedJobId(e.target.value)}
           >
             <option value="" disabled>-- Select a Job / Drive --</option>
             {jobs.map(job => (
               <option key={job.job_id} value={job.job_id}>
                 {job.company_name} - {job.role_name}
               </option>
             ))}
           </select>
           <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
        </div>
      </div>

      {!selectedJobId ? (
         <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <EmptyState title="Select a Job" message="Please select a job drive from the dropdown to manage its rounds." />
         </div>
      ) : roundsLoading ? (
         <div className="h-64 flex items-center justify-center"><Loader /></div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
             <div className="flex items-center text-slate-800 font-bold">
               <Layers className="w-5 h-5 mr-2 text-primary-600" />
               Rounds Pipeline for {selectedJob?.company_name}
             </div>
             <Button variant="primary" icon={<Plus className="w-4 h-4"/>} size="sm" onClick={openAddModal}>Add Round</Button>
          </div>

          {rounds.length === 0 ? (
             <div className="glass-card p-12 text-center">
                <p className="text-slate-500">No rounds defined. Add the first round (e.g. Online Test) to begin tracking.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 gap-6">
                {rounds.map(round => (
                  <div key={round.round_id} className="glass-card overflow-hidden">
                    <div className="bg-slate-50/80 p-4 border-b border-slate-100 flex justify-between items-center">
                       <div>
                         <div className="flex items-center">
                           <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded border border-primary-200 mr-3">
                             Seq {round.sequence_number}
                           </span>
                           <h3 className="font-bold text-lg text-slate-800">{round.round_name}</h3>
                         </div>
                       </div>
                       <div className="flex space-x-2">
                         <Button variant="secondary" size="sm" onClick={() => openResultModal(round)}>Grade Student</Button>
                         <button onClick={() => openEditModal(round)} className="p-2 text-slate-400 hover:text-primary-600 transition-colors"><Edit className="w-4 h-4" /></button>
                         <button onClick={() => handleDelete(round.round_id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </div>
                    
                    <div className="p-0">
                      {(!results[round.round_id] || results[round.round_id].length === 0) ? (
                         <div className="p-6 text-center text-sm text-slate-400">No results recorded for this round yet.</div>
                      ) : (
                         <table className="w-full text-left text-sm">
                           <thead>
                             <tr className="bg-white text-slate-500 border-b border-slate-50">
                               <th className="px-6 py-3 font-medium">Student</th>
                               <th className="px-6 py-3 font-medium">Roll No</th>
                               <th className="px-6 py-3 font-medium">Remarks</th>
                               <th className="px-6 py-3 font-medium text-right">Result</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                             {results[round.round_id].map(res => (
                               <tr key={res.result_id} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-3 font-medium text-slate-800">{res.student_name}</td>
                                 <td className="px-6 py-3 text-slate-500 font-mono">{res.roll_no}</td>
                                 <td className="px-6 py-3 text-slate-500 italic">{res.remarks || '-'}</td>
                                 <td className="px-6 py-3 text-right">
                                   {res.status === 'Cleared' ? (
                                     <span className="inline-flex items-center text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">
                                       <CheckCircle className="w-3.5 h-3.5 mr-1" /> Cleared
                                     </span>
                                   ) : res.status === 'Failed' ? (
                                     <span className="inline-flex items-center text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                                       <XCircle className="w-3.5 h-3.5 mr-1" /> Failed
                                     </span>
                                   ) : (
                                     <span className="inline-flex items-center text-amber-700 font-medium bg-amber-50 px-2 py-1 rounded">
                                       Pending
                                     </span>
                                   )}
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                      )}
                    </div>
                  </div>
                ))}
             </div>
          )}
        </div>
      )}

      {/* Round Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Add Placement Round' : 'Edit Round'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Round Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Technical Interview 1"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.round_name}
              onChange={e => setFormData({...formData, round_name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sequence Number (Order)</label>
            <input 
              type="number" 
              required
              min="1"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.sequence_number}
              onChange={e => setFormData({...formData, sequence_number: e.target.value})}
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
            <Button variant="primary" type="submit" isLoading={submitting}>Save Round</Button>
          </div>
        </form>
      </Modal>

      {/* Result Submit Modal */}
      <Modal isOpen={isResultModalOpen} onClose={() => setIsResultModalOpen(false)} title={`Grade: ${activeRound?.round_name}`}>
        <form onSubmit={handleResultSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
          
          {applications.length === 0 ? (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-start">
               <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
               No eligible students found. Run competitive shortlist (Manage Jobs) or set application status to Shortlisted or In round before grading.
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Student</label>
                <select 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium"
                  value={resultForm.application_id}
                  onChange={e => setResultForm({...resultForm, application_id: e.target.value})}
                >
                  {applications.map(app => (
                    <option key={app.application_id} value={app.application_id}>
                      {app.student_name} ({app.roll_no})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Result Status</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  value={resultForm.status}
                  onChange={e => setResultForm({...resultForm, status: e.target.value})}
                >
                  <option value="Cleared">Cleared — passed this round</option>
                  <option value="Failed">Failed — eliminated</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Remarks (Optional)</label>
                <textarea 
                  rows="3"
                  placeholder="e.g. Strong in DSA, weak in OS."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  value={resultForm.remarks}
                  onChange={e => setResultForm({...resultForm, remarks: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <Button variant="ghost" onClick={() => setIsResultModalOpen(false)} type="button">Cancel</Button>
                <Button variant="primary" type="submit" isLoading={submitting}>Submit Result</Button>
              </div>
            </>
          )}
        </form>
      </Modal>

    </PageWrapper>
  );
};

export default ManageRounds;
