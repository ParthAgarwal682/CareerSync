import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  User, 
  Building2, 
  BarChart3, 
  Users,
  LogOut,
  X,
  Layers,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true, state: {} });
  };
  
  const studentLinks = [
    { name: 'Dashboard', path: '/student', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Jobs', path: '/student/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Applications', path: '/student/applications', icon: <FileText className="w-5 h-5" /> },
    { name: 'Profile', path: '/student/profile', icon: <User className="w-5 h-5" /> },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Companies', path: '/admin/companies', icon: <Building2 className="w-5 h-5" /> },
    { name: 'Jobs', path: '/admin/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Applications', path: '/admin/applications', icon: <FileText className="w-5 h-5" /> },
    { name: 'Rounds', path: '/admin/rounds', icon: <Layers className="w-5 h-5" /> },
    { name: 'Students', path: '/admin/students', icon: <Users className="w-5 h-5" /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const links = user?.role === 'Admin' ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <div 
        className={`fixed inset-y-0 left-0 bg-[#4843d1] w-64 text-white z-40 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-screen`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 justify-between border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#4843d1] font-bold text-xl shadow-sm">
              C
            </div>
            <span className="font-bold text-xl tracking-tight">CareerSync</span>
          </div>
          <button onClick={onClose} className="md:hidden text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/student' || link.path === '/admin'}
              className={({ isActive }) => 
                `flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-white/15 text-white font-medium shadow-glass border border-white/10' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1'
                }`
              }
            >
              <div className="mr-3">{link.icon}</div>
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions (Logout) */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-3 text-white/70 rounded-xl hover:bg-white hover:text-red-500 hover:shadow-md transition-all group"
          >
            <LogOut className="w-5 h-5 mr-3 group-hover:text-red-500" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
