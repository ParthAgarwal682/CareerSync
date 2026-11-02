import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-8 text-center text-sm text-slate-400 mt-auto">
      <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 max-w-7xl mx-auto px-4">
        <span>© 2026 CareerSync. All Rights Reserved.</span>
        <div className="flex space-x-6 uppercase tracking-wider text-xs">
          <Link to="#" className="hover:text-primary-600 transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-primary-600 transition-colors">Terms of Service</Link>
          <Link to="#" className="hover:text-primary-600 transition-colors">Contact Support</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
