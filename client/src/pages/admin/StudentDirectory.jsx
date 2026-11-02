import React, { useState, useEffect } from 'react';
import { Search, Filter, Mail, ExternalLink, Download } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';

const ALL_BRANCHES = ['All Branches', 'CSE', 'ECE', 'EEE', 'ME', 'CE', 'MATH'];

const StudentDirectory = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minCgpa, setMinCgpa] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      let url = '/students?';
      if (branchFilter && branchFilter !== 'All Branches') url += `branch=${branchFilter}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (minCgpa) url += `min_cgpa=${minCgpa}&`;
      
      const { data } = await api.get(url);
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [branchFilter, statusFilter, minCgpa]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.roll_no.toLowerCase().includes(search.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Roll No', 'Name', 'Branch', 'CGPA', 'Graduation Year', 'Active Backlogs', 'Placement Status', 'Resume Link'];
    const escapeCell = (val) => {
      const str = String(val ?? '');
      if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };
    const rows = filteredStudents.map((s) => [
      s.roll_no,
      s.name,
      s.branch,
      s.cgpa,
      s.graduation_year,
      s.active_backlogs,
      s.placement_status,
      s.resume_link || '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Student Directory</h1>
          <p className="text-slate-500 mt-2">Database of all registered students and their placement status</p>
        </div>
        <button
          type="button"
          onClick={exportToCSV}
          disabled={filteredStudents.length === 0}
          className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 mr-2" /> Export to CSV
        </button>
      </div>

      <div className="glass-card mb-8">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl flex flex-wrap gap-4 items-center">
          
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 outline-none text-sm"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={branchFilter}
                onChange={e => setBranchFilter(e.target.value)}
                className="pl-9 pr-8 py-2 rounded-xl border border-slate-200 focus:border-primary-500 outline-none text-sm appearance-none bg-white"
              >
                {ALL_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 outline-none text-sm bg-white"
            >
              <option value="">All Statuses</option>
              <option value="Unplaced">Unplaced</option>
              <option value="Placed">Placed</option>
            </select>

            <select
              value={minCgpa}
              onChange={e => setMinCgpa(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 outline-none text-sm bg-white"
            >
              <option value="">Any CGPA</option>
              <option value="6.0">CGPA &gt; 6.0</option>
              <option value="7.0">CGPA &gt; 7.0</option>
              <option value="8.0">CGPA &gt; 8.0</option>
              <option value="9.0">CGPA &gt; 9.0</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="p-12"><Loader /></div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12"><EmptyState title="No students found" message="Try adjusting your filters or search query." /></div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-white text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4 font-semibold">Student Name</th>
                  <th className="px-6 py-4 font-semibold">Academic Profile</th>
                  <th className="px-6 py-4 font-semibold text-center">Backlogs</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Resume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((student) => (
                  <tr key={student.student_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold mr-3 border border-primary-200">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{student.name}</div>
                          <div className="text-xs font-mono text-slate-500">{student.roll_no}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-semibold">{student.branch}</span>
                         <span className="text-slate-700 font-medium text-sm">{student.cgpa} CGPA</span>
                       </div>
                       <div className="text-xs text-slate-400 mt-1">Class of {student.graduation_year}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       {student.active_backlogs > 0 ? (
                         <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">
                           {student.active_backlogs}
                         </span>
                       ) : (
                         <span className="text-slate-400">-</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <Badge status={student.placement_status === 'Placed' ? 'Selected' : 'Pending'} customText={student.placement_status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                       {student.resume_link ? (
                         <a href={student.resume_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">
                            View <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                         </a>
                       ) : (
                         <span className="text-sm text-slate-400 italic">Not Uploaded</span>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default StudentDirectory;
