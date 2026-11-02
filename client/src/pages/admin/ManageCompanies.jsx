import React, { useState, useEffect } from 'react';
import { Search, Plus, Building2, MapPin, Mail, User, Phone, Edit, Trash2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentCompany, setCurrentCompany] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    hr_name: '',
    hr_email: '',
    logo_url: ''
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/companies?search=${search}`);
      if (data.success) {
        setCompanies(data.companies);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const delayDebounceFn = setTimeout(() => {
      fetchCompanies();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ name: '', industry: '', location: '', hr_name: '', hr_email: '', logo_url: '' });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (company) => {
    setModalMode('edit');
    setCurrentCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry,
      location: company.location,
      hr_name: company.hr_name,
      hr_email: company.hr_email,
      logo_url: company.logo_url || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company? All associated jobs may also be affected.')) {
      try {
        await api.delete(`/companies/${id}`);
        fetchCompanies();
      } catch (err) {
        alert(err.response?.data?.error?.message || 'Failed to delete company');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (modalMode === 'add') {
        await api.post('/companies', formData);
      } else {
        await api.put(`/companies/${currentCompany.company_id}`, formData);
      }
      setIsModalOpen(false);
      fetchCompanies();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save company');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Manage Companies</h1>
          <p className="text-slate-500 mt-2">Add or update recruitment partners</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={openAddModal}>
          Add Company
        </Button>
      </div>

      <div className="glass-card mb-8">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12"><Loader /></div>
          ) : companies.length === 0 ? (
            <div className="p-8"><EmptyState title="No companies found" message="Try adjusting your search or add a new company." /></div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4 font-semibold">Company Details</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">HR Contact</th>
                  <th className="px-6 py-4 font-semibold text-center">Jobs Posted</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {companies.map((company) => (
                  <tr key={company.company_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center font-bold text-lg mr-4 border border-primary-100 overflow-hidden">
                          {company.logo_url ? (
                            <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-primary-600">{company.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{company.name}</div>
                          <div className="text-sm text-slate-500">{company.industry}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {company.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800 font-medium mb-0.5 flex items-center">
                         <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                         {company.hr_name}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center">
                         <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                         {company.hr_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge status="Selected" customText={`${company.jobs_count} Jobs`} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <button onClick={() => openEditModal(company)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                         <Edit className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleDelete(company.company_id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Company' : 'Edit Company'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">HR Name</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.hr_name}
                onChange={e => setFormData({...formData, hr_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">HR Email</label>
              <input 
                type="email" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.hr_email}
                onChange={e => setFormData({...formData, hr_email: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Logo URL <span className="text-slate-400 font-normal">(optional)</span></label>
            <input 
              type="url" 
              placeholder="https://logo.clearbit.com/company.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.logo_url}
              onChange={e => setFormData({...formData, logo_url: e.target.value})}
            />
            {formData.logo_url && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-10 h-10 border border-slate-200 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  <img src={formData.logo_url} alt="Preview" className="w-full h-full object-contain p-1" onError={(e) => e.target.style.display='none'} />
                </div>
                <span className="text-xs text-slate-400">Logo preview</span>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
            <Button variant="primary" type="submit" isLoading={submitting}>
              {modalMode === 'add' ? 'Add Company' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

    </PageWrapper>
  );
};

export default ManageCompanies;
