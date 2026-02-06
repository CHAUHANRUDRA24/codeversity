import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Eye, EyeOff, Info } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('candidate'); // 'candidate' or 'recruiter'
  const [showPassword, setShowPassword] = useState(false);
  const [showDemocreds, setShowDemoCreds] = useState(false);

  // SAP-style minimal colors
  const activeColor = role === 'recruiter' ? 'bg-blue-600' : 'bg-indigo-600';
  const ringColor = role === 'recruiter' ? 'focus:ring-blue-500' : 'focus:ring-indigo-500';

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const DemoAccounts = {
    recruiter: [
      'recruiter1@intellihire.com',
      'recruiter2@intellihire.com',
      'recruiter3@intellihire.com',
      'recruiter4@intellihire.com',
      'recruiter5@intellihire.com',
    ],
    candidate: [
      'candidate1@intellihire.com',
      'candidate2@intellihire.com',
      'candidate3@intellihire.com',
      'candidate4@intellihire.com',
      'candidate5@intellihire.com',
    ]
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-xl ${role === 'recruiter' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'} transition-colors duration-300`}>
              {role === 'recruiter' ? <Briefcase size={32} /> : <User size={32} />}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">IntelliHire</h1>
          <p className="text-sm text-gray-500 mt-2">AI-Driven Intelligent Hiring Platform</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
          <button
            onClick={() => setRole('candidate')}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              role === 'candidate' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User size={16} className="mr-2" />
            Candidate
          </button>
          <button
            onClick={() => setRole('recruiter')}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              role === 'recruiter' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Briefcase size={16} className="mr-2" />
            Recruiter
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                className={`block w-full pl-3 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent transition-shadow sm:text-sm`}
                placeholder={role === 'recruiter' ? 'recruiter@intellihire.com' : 'candidate@intellihire.com'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className={`block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent transition-shadow sm:text-sm`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white ${activeColor} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 ${ringColor} transition-all transform hover:-translate-y-0.5`}
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-4 text-sm max-w-xs mx-auto">
          {/* Register button removed as requested */}
          <a href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
            &larr; Back to Landing Page
          </a>
        </div>
      </div>

      {/* Demo Credentials Section */}
      <div className="mt-8 max-w-md w-full">
        <button 
          onClick={() => setShowDemoCreds(!showDemocreds)}
          className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <Info size={16} />
          {showDemocreds ? 'Hide Demo credentials' : 'Show Demo credentials'}
        </button>

        {showDemocreds && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
             {/* Candidate Accounts */}
             <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-indigo-600 mb-2 flex items-center gap-2">
                   <User size={14} /> Candidates
                </h3>
                <ul className="text-xs space-y-1 text-gray-600">
                   {DemoAccounts.candidate.map(email => (
                      <li key={email} className="font-mono">{email}</li>
                   ))}
                </ul>
                <div className="mt-2 text-xs text-gray-400 border-t pt-2">Password: password123</div>
             </div>

             {/* Recruiter Accounts */}
             <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                   <Briefcase size={14} /> Recruiters
                </h3>
                <ul className="text-xs space-y-1 text-gray-600">
                   {DemoAccounts.recruiter.map(email => (
                      <li key={email} className="font-mono">{email}</li>
                   ))}
                </ul>
                <div className="mt-2 text-xs text-gray-400 border-t pt-2">Password: password123</div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
