import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { formatApplicationStatus } from '../../utils/applicationStatus';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data } = await api.get('/applications/my');
        if (data.success) {
          setApplications(data.applications);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  return (
    <PageWrapper>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Application Tracker</h1>
          <p className="text-slate-500 mt-2">Monitor the progress of your active applications.</p>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : applications.length === 0 ? (
        <EmptyState title="No applications yet" message="Start applying to jobs to track them here." />
      ) : (
        <div className="space-y-6">
           {applications.map(app => (
             <div key={app.application_id} className="glass-card p-6 relative overflow-hidden">
               {app.app_status === 'Selected' && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}
               {app.app_status === 'Rejected' && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}
               
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                 <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xl shadow-sm overflow-hidden shrink-0">
                      {app.logo_url ? (
                         <img src={app.logo_url} alt={app.company_name} className="w-full h-full object-contain p-1" />
                      ) : (
                         app.company_name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{app.role_name}</h3>
                      <p className="text-slate-500 font-medium">{app.company_name}</p>
                    </div>
                 </div>
                 <div className="flex flex-col items-end">
                    <Badge status={app.app_status} customText={formatApplicationStatus(app)} />
                    <span className="text-xs text-slate-400 mt-2">Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                 </div>
               </div>

               {/* Simulated Progress Bar based on status (In a real app, we'd query /applications/:id/rounds) */}
               <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    <span className={app.app_status !== 'Rejected' ? 'text-primary-600' : ''}>Applied</span>
                    <span className={['Shortlisted', 'In_Round'].includes(app.app_status) ? 'text-primary-600' : ''}>In Progress</span>
                    <span className={app.app_status === 'Selected' ? 'text-emerald-600' : ''}>Final Result</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${app.app_status === 'Selected' ? 'bg-emerald-500 w-full' : app.app_status === 'Rejected' ? 'bg-red-500 w-full' : 'bg-primary-500 w-1/2'}`}></div>
                  </div>
               </div>
             </div>
           ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default MyApplications;
