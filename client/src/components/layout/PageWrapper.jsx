import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AiAssistant from './AiAssistant';
import { useAuth } from '../../hooks/useAuth';

const PageWrapper = ({ children, showBack = true }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden relative font-sans">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {showBack && (
              <button
                type="button"
                onClick={goBack}
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go back
              </button>
            )}
            {children}
          </div>
        </main>
      </div>
      {user && <AiAssistant />}
    </div>
  );
};

export default PageWrapper;
