import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Briefcase, Play, Clock, Layout, Loader, LogOut, FileText, CheckCircle } from 'lucide-react';

const CandidateDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
             // Fetch all available jobs
             try {
                 const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
                 const querySnapshot = await getDocs(q);
                 const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                 setJobs(jobsData);
             } catch (error) {
                 console.error("Error fetching jobs:", error);
             }
             setLoading(false);
        };
        fetchJobs();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Navbar */}
            <nav className="sticky top-0 z-30 w-full bg-white border-b border-slate-200">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">IntelliHire</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#" className="text-sm font-medium text-blue-600">Dashboard</a>
                        <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900">My Profile</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-900">{user?.email}</p>
                                <p className="text-xs text-slate-500">Candidate</p>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-white shadow-sm">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <button onClick={handleLogout} title="Logout" className="ml-2 text-slate-400 hover:text-red-600 transition-colors">
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Welcome Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                Welcome back, {user?.email?.split('@')[0]} <span className="text-2xl">👋</span>
                            </h1>
                            <p className="mt-1 text-slate-600">
                                Browse available job assessments below. Good luck!
                            </p>
                        </div>

                        {/* Available Tests */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Available Assessments</h2>
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{jobs.length}</span>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                                    Loading assessments...
                                </div>
                            ) : jobs.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                                    <p className="text-slate-500">No assessments available at this time.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {jobs.map(job => (
                                        <div key={job.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                                                    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${job.experienceLevel === 'Fresher' ? 'bg-green-100 text-green-700' : job.experienceLevel === 'Mid' ? 'bg-yellow-100 text-yellow-700' : 'bg-purple-100 text-purple-700'}`}>
                                                        {job.experienceLevel || 'General'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-sm line-clamp-2 mb-3">{job.description}</p>
                                                
                                                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                                                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 15 Mins</span>
                                                    <span className="flex items-center gap-1"><Layout className="h-3.5 w-3.5" /> {job.questions?.length || 5} Questions</span>
                                                    <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Multiple Choice</span>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => navigate(`/test/${job.id}`)}
                                                className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
                                            >
                                                Start Test <Play className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CandidateDashboard;
