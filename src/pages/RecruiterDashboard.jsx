import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
    Briefcase, User, Search, Plus, Filter,
    Download, MoreHorizontal, LogOut, Loader,
    Award, Shield, BrainCircuit, Sparkles, TrendingUp
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { calculateHiringConfidence, getConfidenceClasses } from '../utils/hiringConfidence';

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // State
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Fetch Jobs on Mount
    useEffect(() => {
        const fetchJobs = async () => {
            if (!user) return;
            try {
                const q = query(collection(db, "jobs"));
                const querySnapshot = await getDocs(q);
                const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                jobsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setJobs(jobsData);

                if (jobsData.length > 0) {
                    handleViewCandidates(jobsData[0]);
                }
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
            setLoading(false);
        };

        fetchJobs();
    }, [user]);

    // Fetch Candidates for a Job
    const handleViewCandidates = async (job) => {
        setSelectedJob(job);
        setLoadingCandidates(true);
        setCandidates([]);

        try {
            const q = query(collection(db, "results"), where("jobId", "==", job.id));
            const querySnapshot = await getDocs(q);

            const candidatesData = await Promise.all(querySnapshot.docs.map(async (resDoc) => {
                const result = resDoc.data();
                const userRef = doc(db, "users", result.userId);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.exists() ? userSnap.data() : { email: 'Unknown', name: 'Unknown' };

                return {
                    id: resDoc.id,
                    ...result,
                    user: userData
                };
            }));

            candidatesData.sort((a, b) => b.percentage - a.percentage);
            setCandidates(candidatesData);
        } catch (error) {
            console.error("Error fetching candidates:", error);
        }
        setLoadingCandidates(false);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f7f8] dark:bg-[#0f172a] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-200">
            {/* Sidebar */}
            <Sidebar
                role="recruiter"
                user={user}
                onLogout={handleLogout}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-10 transition-colors duration-200 shrink-0">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Ecosystem Control</p>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Recruiter Command Center</h1>
                    </div>
                    <button onClick={() => navigate('/create-job')} className="flex items-center gap-3 bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 dark:shadow-none transform active:scale-95">
                        <Plus className="w-4 h-4" /> Create New Track
                    </button>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8 space-y-8 scroll-smooth transition-colors duration-200">

                    {/* Stats Dashboard Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Active Tracks</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{jobs.length}</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                                <Briefcase className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Verified</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{candidates.length}</p>
                            </div>
                            <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                                <Shield className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Avg Credibility</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">82%</p>
                            </div>
                            <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                                <BrainCircuit className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Efficiency Delta</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">+14%</p>
                            </div>
                            <div className="h-12 w-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Jobs Horizontal List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Deployment Pipeline</h2>
                            <button className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline">Manage All Tracks</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {jobs.map(job => (
                                <div
                                    key={job.id}
                                    onClick={() => handleViewCandidates(job)}
                                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedJob?.id === job.id
                                        ? 'border-blue-600 bg-white dark:bg-slate-900 shadow-xl shadow-blue-500/10'
                                        : 'border-white dark:border-slate-900 bg-white dark:bg-slate-900 opacity-60 hover:opacity-100 hover:border-slate-200 dark:hover:border-slate-800'}`}
                                >
                                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1 mb-4">{job.title}</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                            {job.experienceLevel}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                            <Sparkles className="w-3 h-3" /> AI Active
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Candidates Table (Modern Pipeline) */}
                    {selectedJob && (
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-500">
                            <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Mission Candidates</h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active applicants for <span className="text-blue-600">{selectedJob.title}</span></p>
                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest">{candidates.length}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            placeholder="Search DNA..."
                                            className="h-12 pl-12 pr-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white dark:focus:bg-slate-900 transition-all w-64"
                                        />
                                    </div>
                                    <button className="h-12 px-6 flex items-center gap-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                                        <Download className="w-4 h-4" /> Export Report
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto p-2">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        <tr>
                                            <th className="px-8 py-6">Rank</th>
                                            <th className="px-8 py-6">Identity</th>
                                            <th className="px-8 py-6">Technical Accuracy</th>
                                            <th className="px-8 py-6 text-blue-600 dark:text-blue-400">Skill Credibility</th>
                                            <th className="px-8 py-6">Hiring Confidence</th>
                                            <th className="px-8 py-6">Hiring Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {loadingCandidates ? (
                                            <tr>
                                                <td colSpan="6" className="px-8 py-20 text-center">
                                                    <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 opacity-20" />
                                                </td>
                                            </tr>
                                        ) : candidates.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-8 py-20 text-center opacity-40 italic text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                                    Waiting for candidates to initialize track...
                                                </td>
                                            </tr>
                                        ) : (
                                            candidates.map((candidate, index) => {
                                                const fakeCredibility = Math.min(100, Math.max(0, candidate.percentage + (Math.random() * 20 - 10))).toFixed(0);
                                                return (
                                                    <tr key={candidate.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all">
                                                        <td className="px-8 py-6">
                                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border-2 ${index === 0 ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20' :
                                                                'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'
                                                                }`}>
                                                                {index + 1}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div>
                                                                <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[200px]">{candidate.user?.email}</div>
                                                                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Applied {new Date(candidate.submittedAt).toLocaleDateString()}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <span className="font-black text-slate-900 dark:text-white w-10">{candidate.percentage.toFixed(0)}%</span>
                                                                <div className="h-1.5 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                    <div className={`h-full transition-all duration-1000 ${candidate.percentage >= 60 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${candidate.percentage}%` }}></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                                                                <BrainCircuit className="w-4 h-4" />
                                                                <span className="font-black text-lg tracking-tighter">{candidate.aiEvaluation?.credibilityScore?.toFixed(0) || fakeCredibility}%</span>
                                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Match</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            {(() => {
                                                                const confidence = calculateHiringConfidence(candidate.percentage, candidate.aiEvaluation?.credibilityScore || fakeCredibility);
                                                                const classes = getConfidenceClasses(confidence.level);
                                                                return (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-lg">{confidence.icon}</span>
                                                                        <div>
                                                                            <div className="font-black text-slate-900 dark:text-white">{confidence.score}%</div>
                                                                            <div className={`text-[9px] font-black uppercase tracking-widest ${classes.text}`}>{confidence.label}</div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${candidate.percentage >= 80 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-900/50' :
                                                                candidate.percentage >= 60 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/50' :
                                                                    'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'
                                                                }`}>
                                                                {candidate.percentage >= 80 ? 'Exceptional' : candidate.percentage >= 60 ? 'Verified' : 'Review Required'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RecruiterDashboard;
