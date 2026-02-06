import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Briefcase, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('candidate'); // Default role
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            await signup(email, password, role);
            // Redirect based on role
            navigate(role === 'recruiter' ? '/recruiter-dashboard' : '/candidate-dashboard');
        } catch (err) {
            setError('Failed to create an account. ' + err.message);
        }
        setLoading(false);
    };

    const activeColor = role === 'recruiter' ? 'bg-blue-600' : 'bg-indigo-600';
    const ringColor = role === 'recruiter' ? 'focus:ring-blue-500' : 'focus:ring-indigo-500';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8 font-sans">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Account</h1>
                    <p className="text-sm text-gray-500 mt-2">Join IntelliHire today</p>
                </div>

                {/* Role Selector */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => setRole('candidate')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                            role === 'candidate' 
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                                : 'border-gray-200 hover:border-gray-300 text-gray-500'
                        }`}
                    >
                        <User className="mb-2" size={24} />
                        <span className="font-medium text-sm">Candidate</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('recruiter')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                            role === 'recruiter' 
                                ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                : 'border-gray-200 hover:border-gray-300 text-gray-500'
                        }`}
                    >
                        <Briefcase className="mb-2" size={24} />
                        <span className="font-medium text-sm">Recruiter</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSignup} className="space-y-6">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent`}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent`}
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
                        className={`w-full py-2.5 px-4 rounded-lg shadow-sm text-sm font-semibold text-white ${activeColor} hover:opacity-90 disabled:opacity-50 transition-all`}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className={`font-medium ${role === 'recruiter' ? 'text-blue-600' : 'text-indigo-600'} hover:underline`}>
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
