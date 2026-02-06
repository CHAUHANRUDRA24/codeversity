import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

import { demoUsers } from '../data/demoUsers';

const Login = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);

  // Dev Accounts Configuration (Mapped from shared source)
  const DEV_ACCOUNTS = {
    recruiters: demoUsers.recruiters.map(u => ({ ...u, label: u.name })),
    candidates: demoUsers.candidates.map(u => ({ ...u, label: u.name }))
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const performLogin = async (loginEmail, loginPassword) => {
    setError('');
    setLoading(true);
    
    try {
      await login(loginEmail, loginPassword);
      // Check profile and repair if needed
      await checkAndRepairProfile(auth.currentUser?.uid, loginEmail);
    } catch (err) {
       console.error(err);
       setError('Failed to sign in: ' + err.message);
    }
    setLoading(false);
  };

  const checkAndRepairProfile = async (uid, userEmail) => {
      if (!uid) return;
      
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const role = docSnap.data().role;
        navigate(role === 'recruiter' ? '/recruiter-dashboard' : '/candidate-dashboard');
      } else {
        // RECOVERY: Auth exists but Firestore doc is missing (likely due to permission error during creation)
        console.warn("Profile missing. Attempting auto-repair...");
        
        // Infer role from email for demo accounts, or default to candidate
        const isRecruiter = userEmail.includes('recruiter');
        const role = isRecruiter ? 'recruiter' : 'candidate';
        
        try {
            await setDoc(docRef, {
                email: userEmail,
                role: role,
                createdAt: new Date().toISOString(),
                isRepaired: true
            });
            navigate(isRecruiter ? '/recruiter-dashboard' : '/candidate-dashboard');
        } catch (repairErr) {
             console.error("Repair failed:", repairErr);
             setError(`Login successful, but profile creation failed: ${repairErr.message}. Check Firestore Rules.`);
        }
      }
  };

  const handleDevAutoFill = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    // Optional: Auto-submit for convenience, but using the standard login function
    performLogin(account.email, account.password); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8 font-sans relative">
      
       {/* Dev Tools Floating Button */}
       <div className="fixed bottom-4 right-4 z-50">
          <button 
            onClick={() => setShowDevPanel(!showDevPanel)}
            className="bg-slate-800 text-white p-3 rounded-full shadow-xl hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-xs font-bold uppercase">Dev Login</span>
          </button>
          
          {showDevPanel && (
              <div className="absolute bottom-14 right-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-slate-800 text-white p-3 flex justify-between items-center">
                      <span className="font-bold text-sm">Select User (Verified)</span>
                      <button onClick={() => setShowDevPanel(false)} className="hover:text-red-400"><span className="material-symbols-outlined text-sm">close</span></button>
                  </div>
                  <div className="p-4 max-h-[60vh] overflow-y-auto">
                      <div className="mb-4">
                          <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Recruiters</h3>
                          <div className="space-y-2">
                              {DEV_ACCOUNTS.recruiters.map((acc, idx) => (
                                  <button key={idx} onClick={() => handleDevAutoFill(acc)} disabled={loading} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-blue-50 text-slate-700 border border-slate-100 flex items-center justify-between group">
                                      <span>{acc.label}</span>
                                      <span className="material-symbols-outlined text-transparent group-hover:text-blue-600 text-[18px]">key</span>
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div>
                          <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Candidates</h3>
                          <div className="space-y-2">
                              {DEV_ACCOUNTS.candidates.map((acc, idx) => (
                                  <button key={idx} onClick={() => handleDevAutoFill(acc)} disabled={loading} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-indigo-50 text-slate-700 border border-slate-100 flex items-center justify-between group">
                                      <span>{acc.label}</span>
                                      <span className="material-symbols-outlined text-transparent group-hover:text-indigo-600 text-[18px]">key</span>
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          )}
       </div>

      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-2">Sign in to your IntelliHire account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
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
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
           <p className="text-gray-500">
             Don't have an account?{' '}
             <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
               Sign up
             </Link>
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
