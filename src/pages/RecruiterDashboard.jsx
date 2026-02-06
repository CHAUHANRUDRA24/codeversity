import React from 'react';
import { LogOut, LayoutDashboard, FileText, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecruiterDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            IntelliHire <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Recruiter</span>
          </h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium">
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <FileText size={20} /> Jobs & JDs
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <User size={20} /> Candidates
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Settings size={20} /> Settings
          </a>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-100">
           <button onClick={() => navigate('/login')} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors">
             <LogOut size={20} /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back, Recruiter</h2>
            <p className="text-gray-500">Here's what's happening with your hiring pipeline.</p>
          </div>
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">R</div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm mb-1">Active Jobs</div>
            <div className="text-3xl font-bold text-gray-900">12</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm mb-1">Total Candidates</div>
            <div className="text-3xl font-bold text-gray-900">148</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm mb-1">Interviews Scheduled</div>
            <div className="text-3xl font-bold text-gray-900">5</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecruiterDashboard;
