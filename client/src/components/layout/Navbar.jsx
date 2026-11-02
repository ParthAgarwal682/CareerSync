import React, { useState } from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0">
      
      {/* Left side: Hamburger (Mobile) + Search */}
      <div className="flex items-center flex-1">
        <button 
          onClick={onMenuClick}
          className="mr-4 text-slate-500 hover:text-slate-700 md:hidden focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Search */}
        <div className="hidden sm:flex max-w-sm w-full bg-slate-50 rounded-full px-4 py-2 items-center focus-within:ring-2 focus-within:ring-primary-100 border border-transparent focus-within:border-primary-300 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right side: Notifications + Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 mr-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-glass-lg border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-50 font-semibold text-slate-700 text-sm">Notifications</div>
              <div className="px-4 py-3 text-sm text-slate-600 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                Google updated your application status to <span className="font-semibold text-emerald-600">Selected</span>.
              </div>
              <div className="px-4 py-2 text-center text-xs text-primary-600 hover:text-primary-800 cursor-pointer font-medium">View All</div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-4 border-l border-slate-100 cursor-pointer group">
          <div className="text-right hidden sm:flex flex-col justify-center">
            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary-600 transition-colors">
              {user?.profile?.name || user?.email?.split('@')[0] || 'User'}
            </span>
            <span className="text-xs text-slate-400 font-medium">{user?.role}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold relative border border-primary-200 overflow-hidden">
            {user?.profile?.profile_picture ? (
               <img src={user.profile.profile_picture} alt="Profile" className="w-full h-full object-cover z-10" />
            ) : user?.profile?.name ? (
               user.profile.name.charAt(0) 
            ) : (
               <User className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
