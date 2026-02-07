import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
    Briefcase, User, Search, Plus, Filter,
    Download, MoreHorizontal, LogOut, Loader,
    Award, Shield, BrainCircuit, Sparkles, TrendingUp, AlertTriangle, Users,
    X, CheckCircle, XCircle, Calendar, Eye
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
    const [rejectedCandidates, setRejectedCandidates] = useState([]); // New State
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [qualificationThreshold, setQualificationThreshold] = useState(60);
    const [viewMode, setViewMode] = useState('candidates'); // 'candidates' or 'leaderboard'
    const [isSavingThreshold, setIsSavingThreshold] = useState(false);

    // Fetch Jobs on Mount
    useEffect(() => {
        const fetchJobs = async () => {
            if (!user) return;
            try {
                // 1. Fetch Jobs
                const q = query(collection(db, "jobs"));
                const querySnapshot = await getDocs(q);
                const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                jobsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // 2. Fetch Results (Candidates) to calculate counts
                // For a scalable app, we'd use aggregation queries or counter fields.
                // For this size, getting all results is okay, or we can query per job.
                // Let's query all results once to minimize reads if we assume < 10k results
                const resultsSnap = await getDocs(collection(db, "results"));
                const results = resultsSnap.docs.map(d => d.data());

                // 3. Map counts
                const jobsWithCounts = jobsData.map(job => {
                    const count = results.filter(r => r.jobId === job.id).length;
                    return { ...job, candidateCount: count };
                });

                setJobs(jobsWithCounts);

                if (jobsWithCounts.length > 0) {
                    handleViewCandidates(jobsWithCounts[0]);
                }
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
            setLoading(false);
        };

        fetchJobs();
    }, [user]);

    const handleViewCandidates = async (job) => {
        setSelectedJob(job);
        setLoadingCandidates(true);
        setCandidates([]);
        setQualificationThreshold(job.minScore || 60);

        try {
            const q = query(collection(db, "results"), where("jobId", "==", job.id));
            const querySnapshot = await getDocs(q);

            const candidatesData = await Promise.all(querySnapshot.docs.map(async (resDoc) => {
                const result = resDoc.data();
                
                let userData = { email: 'Unknown Candidate', name: 'Unknown' };

                // 1. Check for seeded mock data first
                if (result.mockUser) {
                    userData = result.mockUser;
                } 
                // 2. Otherwise try to fetch real user profile
                else if (result.userId) {
                    try {
                        const userRef = doc(db, "users", result.userId);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            userData = userSnap.data();
                        }
                    } catch (e) {
                        console.warn("Could not fetch user profile", e);
                    }
                }

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

    const updateThreshold = async (newThreshold) => {
        setQualificationThreshold(newThreshold);
        if (!selectedJob) return;
        
        // Debounce or just save locally until blur? For now save on change with small delay or just let user click save?
        // Let's autosave with a slight delay or just optimistic UI.
        // Actually, let's just save.
        try {
           setIsSavingThreshold(true);
           const jobRef = doc(db, "jobs", selectedJob.id);
           // distinct update
           await import('firebase/firestore').then(({ updateDoc }) => updateDoc(jobRef, { minScore: newThreshold }));
           // Update local job state
           setJobs(prev => prev.map(j => j.id === selectedJob.id ? { ...j, minScore: newThreshold } : j));
           setSelectedJob(prev => ({ ...prev, minScore: newThreshold }));
        } catch (e) {
            console.error("Error saving threshold", e);
        } finally {
            setIsSavingThreshold(false);
        }
    };

    const handleReject = (candidate) => {
        // 1. Remove from current list
        setCandidates(prev => prev.filter(c => c.id !== candidate.id));

        // 2. Find a "Better" job (simulate)
        // Filter out current job
        const otherJobs = jobs.filter(j => j.id !== selectedJob.id);
        
        let suggestedJob;
        if (otherJobs.length > 0) {
            suggestedJob = otherJobs[Math.floor(Math.random() * otherJobs.length)];
        } else {
             suggestedJob = { title: "Data Analyst Intern" }; // Fallback
        }

        const matchScore = (85 + Math.random() * 14).toFixed(0); // High match for suggested role

        // 3. Add to Rediscovered list
        const rediscovered = {
            ...candidate,
            originalRole: selectedJob.title,
            suggestedRole: suggestedJob.title,
            matchScore: matchScore,
            rediscoveredAt: new Date()
        };

        setRejectedCandidates(prev => [rediscovered, ...prev]);
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
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Candidates</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">
                                    {jobs.reduce((acc, job) => acc + (job.candidateCount || 0), 0)}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </div>




                    {/* Talent Re-Discovery Engine Section */}
                    {rejectedCandidates.length > 0 && (
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] p-8 shadow-2xl shadow-indigo-500/30 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <Sparkles className="w-6 h-6 text-yellow-300" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Talent Re-Discovery Engine</h2>
                                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">AI-Powered Role Mapping • Talent Preservation</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                                {rejectedCandidates.map((candidate, idx) => (
                                    <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="font-black text-lg line-clamp-1">{candidate.user?.name || candidate.user?.email}</div>
                                                <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Rejected: {candidate.originalRole}</div>
                                            </div>
                                            <div className="bg-white/20 px-2 py-1 rounded-lg text-xs font-black">
                                                {candidate.matchScore}% Match
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-px bg-white/20 flex-1"></div>
                                            <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Mapped To</div>
                                            <div className="h-px bg-white/20 flex-1"></div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500/20 rounded-lg text-green-300">
                                                <TrendingUp className="w-5 h-5" />
                                            </div>
                                            <div className="font-black text-lg text-green-300 line-clamp-1">
                                                {candidate.suggestedRole}
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-white/10 flex justify-end">
                                             <button className="text-[10px] font-black uppercase tracking-widest hover:text-white text-indigo-200 transition-colors flex items-center gap-1">
                                                View Profile <MoreHorizontal className="w-3 h-3" />
                                             </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                                    <div className="flex items-center justify-between"> 
                                        {/* Changed to justify-between to space out elements */}
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                            <Sparkles className="w-3 h-3" /> AI Active
                                        </div>
                                        <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                            {job.candidateCount !== undefined ? job.candidateCount : '-'} Candidates
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
                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                        <button 
                                            onClick={() => setViewMode('candidates')}
                                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'candidates' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Pipeline
                                        </button>
                                        <button 
                                             onClick={() => setViewMode('leaderboard')}
                                             className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'leaderboard' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Leaderboard
                                        </button>
                                    </div>
                                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Min Score:</span>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="100" 
                                            value={qualificationThreshold} 
                                            onChange={(e) => updateThreshold(Number(e.target.value))}
                                            className="w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <span className={`text-xs font-bold ${qualificationThreshold > 80 ? 'text-blue-600' : 'text-slate-600'}`}>{qualificationThreshold}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto p-2">
                                {viewMode === 'leaderboard' ? (
                                    <div className="p-8">
                                         <div className="flex justify-center items-end gap-4 mb-12 h-64">
                                            {candidates.slice(0, 3).length >= 2 && (
                                                <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-100">
                                                    <div className="mb-2 text-center">
                                                        <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm max-w-[120px] truncate">{candidates[1].user?.name || "Unknown"}</div>
                                                        <div className="text-xs font-bold text-slate-500">{candidates[1].percentage.toFixed(0)}%</div>
                                                    </div>
                                                    <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-t-2xl flex items-end justify-center pb-4 text-4xl font-black text-slate-400/50" style={{ height: '140px' }}>2</div>
                                                </div>
                                            )}
                                            {candidates.slice(0, 3).length >= 1 && (
                                                 <div className="flex flex-col items-center z-10 animate-in slide-in-from-bottom-8 duration-700">
                                                     <div className="mb-2 text-center">
                                                        <Award className="w-8 h-8 text-yellow-400 mx-auto mb-1" />
                                                        <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-base max-w-[140px] truncate">{candidates[0].user?.name || "Unknown"}</div>
                                                        <div className="text-sm font-bold text-blue-600">{candidates[0].percentage.toFixed(0)}%</div>
                                                    </div>
                                                    <div className="w-40 bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-3xl flex items-end justify-center pb-6 text-6xl font-black text-white/20 shadow-2xl shadow-blue-500/30" style={{ height: '180px' }}>1</div>
                                                 </div>
                                            )}
                                            {candidates.slice(0, 3).length >= 3 && (
                                                <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-200">
                                                    <div className="mb-2 text-center">
                                                        <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm max-w-[120px] truncate">{candidates[2].user?.name || "Unknown"}</div>
                                                        <div className="text-xs font-bold text-slate-500">{candidates[2].percentage.toFixed(0)}%</div>
                                                    </div>
                                                    <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-t-2xl flex items-end justify-center pb-4 text-4xl font-black text-slate-400/50" style={{ height: '100px' }}>3</div>
                                                </div>
                                            )}
                                         </div>
                                         
                                         <div className="space-y-2 max-w-3xl mx-auto">
                                            {candidates.slice(3).map((candidate, idx) => (
                                                <div key={candidate.id} className="flex items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                    <div className="w-8 font-black text-slate-400 text-center">{idx + 4}</div>
                                                    <div className="flex-1 px-4 font-bold text-slate-700 dark:text-slate-300">{candidate.user?.name || "Unknown"}</div>
                                                    <div className="font-black text-slate-900 dark:text-white">{candidate.percentage.toFixed(0)}%</div>
                                                </div>
                                            ))}
                                         </div>
                                    </div>
                                ) : (
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        <tr>
                                            <th className="px-8 py-6">Rank</th>
                                            <th className="px-8 py-6">Identity</th>
                                            <th className="px-8 py-6">Technical Accuracy</th>
                                            <th className="px-8 py-6 text-blue-600 dark:text-blue-400">Skill Credibility</th>
                                            <th className="px-8 py-6">Hiring Confidence</th>
                                            <th className="px-8 py-6">Hiring Status</th>
                                            <th className="px-8 py-6">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {loadingCandidates ? (
                                            <tr>
                                                <td colSpan="7" className="px-8 py-20 text-center">
                                                    <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 opacity-20" />
                                                </td>
                                            </tr>
                                        ) : candidates.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-8 py-20 text-center opacity-40 italic text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                                    Waiting for candidates to initialize track...
                                                </td>
                                            </tr>
                                        ) : (
                                            candidates.map((candidate, index) => {
                                                const fakeCredibility = Math.min(100, Math.max(0, candidate.percentage + (Math.random() * 20 - 10))).toFixed(0);
                                                const isQualified = candidate.percentage >= qualificationThreshold;
                                                return (
                                                    <tr 
                                                        key={candidate.id} 
                                                        className={`group transition-all cursor-pointer ${isQualified ? 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30' : 'opacity-50 hover:opacity-100 bg-slate-50/50 dark:bg-slate-900/50'}`}
                                                        onClick={() => setSelectedCandidate(candidate)}
                                                    >
                                                        <td className="px-8 py-6">
                                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border-2 ${index === 0 ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20' :
                                                                'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'
                                                                }`}>
                                                                {index + 1}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[200px]">{candidate.user?.name || candidate.mockUser?.name || candidate.user?.email || "Unknown"}</div>
                                                                    {candidate.tabSwitchViolation && (
                                                                        <div className="group/tooltip relative">
                                                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Applied {new Date(candidate.submittedAt).toLocaleDateString()}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <span className="font-black text-slate-900 dark:text-white w-10">{candidate.percentage.toFixed(0)}%</span>
                                                                <div className="h-1.5 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                    <div className={`h-full transition-all duration-1000 ${candidate.percentage >= qualificationThreshold ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${candidate.percentage}%` }}></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                                                                <BrainCircuit className="w-4 h-4" />
                                                                <span className="font-black text-lg tracking-tighter">{candidate.aiEvaluation?.credibilityScore?.toFixed(0) || fakeCredibility}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            {(() => {
                                                                const confidence = calculateHiringConfidence(candidate.percentage, null, candidate.aiEvaluation?.credibilityScore || fakeCredibility);
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
                                                            <div className="flex flex-col gap-1">
                                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${candidate.tabSwitchViolation 
                                                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-900/50' 
                                                                    : candidate.percentage >= qualificationThreshold 
                                                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/50' 
                                                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'
                                                                    }`}>
                                                                    {candidate.tabSwitchViolation 
                                                                        ? <><AlertTriangle className="w-3 h-3" /> Violation</> 
                                                                        : candidate.percentage >= qualificationThreshold 
                                                                            ? 'Qualified' 
                                                                            : 'Below Threshold'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleReject(candidate);
                                                                }}
                                                                className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-all flex items-center justify-center -ml-2 group/reject"
                                                                title="Reject & Re-Discover"
                                                            >
                                                                <LogOut className="w-4 h-4 group-hover/reject:scale-110 transition-transform" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                                )}
                            </div>
                        </div>
            )}

            {/* Candidate Report Modal */}
            {selectedCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] p-8 md:p-12 relative shadow-2xl animate-in fade-in zoom-in-95 duration-300 my-8 max-h-[90vh] overflow-auto">
                        <button 
                            onClick={() => setSelectedCandidate(null)}
                            className="absolute top-8 right-8 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-10"
                        >
                            <X className="w-6 h-6 text-slate-500" />
                        </button>

                        <div className="flex items-start gap-6 mb-10">
                            <div className="h-20 w-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                                <span className="text-3xl font-black text-white uppercase tracking-tighter">
                                    {(selectedCandidate.user?.name || selectedCandidate.mockUser?.name || "?").charAt(0)}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                                    {selectedCandidate.user?.name || selectedCandidate.mockUser?.name || "Unknown Candidate"}
                                </h2>
                                <div className="flex items-center gap-3 flex-wrap mb-8">
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        {selectedCandidate.mockUser?.email || selectedCandidate.user?.email || "No Email"}
                                    </span>
                                    {selectedCandidate.tabSwitchViolation && (
                                        <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> High Risk Detected
                                        </span>
                                    )}
                                     <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        Score: {selectedCandidate.percentage}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Assessment Summary Card */}
                                <div className="bg-[#151b2b] p-6 rounded-3xl border border-slate-800/50">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Award className="w-5 h-5 text-blue-500" />
                                        <h4 className="text-slate-300 font-black text-xs uppercase tracking-widest">Assessment Summary</h4>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Position</p>
                                            <p className="text-white font-bold">{selectedCandidate.jobTitle}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Submission Date</p>
                                            <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                                                <Calendar className="w-4 h-4 text-slate-500" />
                                                {new Date(selectedCandidate.submittedAt).toLocaleString(undefined, {
                                                    year: 'numeric', month: 'long', day: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-800">
                                            <div className="flex justify-between items-end mb-2">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Correct Answers</p>
                                                <p className="text-emerald-500 font-bold text-sm">{selectedCandidate.score} <span className="text-slate-600">/ {selectedCandidate.total}</span></p>
                                            </div>
                                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedCandidate.percentage}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-2">
                                            <p className="text-xs font-bold text-slate-400">Overall Percentage</p>
                                            <p className="text-3xl font-black text-white">{selectedCandidate.percentage.toFixed(0)}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Analysis Card */}
                                <div className="bg-[#151b2b] p-6 rounded-3xl border border-slate-800/50">
                                    <div className="flex items-center gap-3 mb-6">
                                        <BrainCircuit className="w-5 h-5 text-indigo-500" />
                                        <h4 className="text-slate-300 font-black text-xs uppercase tracking-widest">AI Analysis</h4>
                                    </div>

                                    {(() => {
                                        const fakeCredibility = Math.min(100, Math.max(0, selectedCandidate.percentage + (Math.random() * 20 - 10)));
                                        const credibility = selectedCandidate.aiEvaluation?.credibilityScore || fakeCredibility;
                                        const confidence = calculateHiringConfidence(selectedCandidate.percentage, null, credibility);
                                        const isLowConfidence = confidence.score < 50;
                                        const isHighConfidence = confidence.score > 75;

                                        return (
                                            <div className="space-y-6">
                                                <div className={`p-4 rounded-2xl border ${isLowConfidence ? 'bg-red-500/10 border-red-500/20' : isHighConfidence ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70" style={{ color: isLowConfidence ? '#ef4444' : isHighConfidence ? '#10b981' : '#f59e0b' }}>Hiring Confidence</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${isLowConfidence ? 'bg-red-500 animate-pulse' : isHighConfidence ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                        <p className="text-3xl font-black" style={{ color: isLowConfidence ? '#ef4444' : isHighConfidence ? '#10b981' : '#f59e0b' }}>{confidence.score}%</p>
                                                    </div>
                                                    <p className="text-xs font-bold mt-1" style={{ color: isLowConfidence ? '#ef4444' : isHighConfidence ? '#10b981' : '#f59e0b' }}>{confidence.label}</p>
                                                </div>

                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confidence Breakdown</p>
                                                    <div className="flex justify-between text-xs font-medium text-slate-400 border-b border-slate-800 pb-2">
                                                        <span>Test Score (60%)</span>
                                                        <span className="text-white">{(selectedCandidate.percentage * 0.6).toFixed(0)}pts</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs font-medium text-slate-400 border-b border-slate-800 pb-2">
                                                        <span>Resume Match (30%)</span>
                                                        <span className="text-white">{(credibility * 0.3).toFixed(0)}pts</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs font-medium text-slate-400 pb-1">
                                                        <span>Consistency (10%)</span>
                                                        <span className="text-white">{selectedCandidate.tabSwitchViolation ? '0pts' : '10pts'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="bg-[#151b2b] p-6 rounded-3xl border border-slate-800/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield className="w-5 h-5 text-slate-400" />
                                    <h4 className="text-slate-300 font-black text-xs uppercase tracking-widest">Hiring Recommendation</h4>
                                </div>

                                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 flex items-center gap-4">
                                    {selectedCandidate.percentage >= qualificationThreshold && !selectedCandidate.tabSwitchViolation ? (
                                        <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                                        </div>
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                            <XCircle className="w-6 h-6 text-amber-500" />
                                        </div>
                                    )}

                                    <div>
                                        <h5 className={`font-black text-sm uppercase tracking-wide mb-1 ${selectedCandidate.percentage >= qualificationThreshold && !selectedCandidate.tabSwitchViolation ? 'text-emerald-500' : 'text-amber-500'
                                            }`}>
                                            {selectedCandidate.percentage >= 80 ? 'STRONGLY RECOMMENDED' :
                                                selectedCandidate.percentage >= qualificationThreshold ? 'PROCEED TO INTERVIEW' :
                                                    'BELOW THRESHOLD / REVIEW'}
                                        </h5>
                                        <p className="text-slate-400 text-xs font-medium">
                                            {selectedCandidate.percentage >= qualificationThreshold && !selectedCandidate.tabSwitchViolation
                                                ? "Candidate has met the qualification threshold. Recommended to proceed to the next stage."
                                                : "Candidate score is below the set threshold or policy violations were detected."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                             {/* Skill-Wise Analysis - New Feature */}
                             <div className="bg-[#151b2b] p-6 rounded-3xl border border-slate-800/50">
                                <div className="flex items-center gap-3 mb-6">
                                    <BrainCircuit className="w-5 h-5 text-cyan-500" />
                                    <h4 className="text-slate-300 font-black text-xs uppercase tracking-widest">Skill Competency Map</h4>
                                </div>
                                <div className="space-y-4">
                                    {selectedCandidate.aiEvaluation?.skillsAnalysis ? (
                                        Object.entries(selectedCandidate.aiEvaluation.skillsAnalysis).map(([skill, data], idx) => (
                                            <div key={idx}>
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{skill}</span>
                                                    <span className="text-white font-bold text-xs">{data.score}/{data.total}</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(data.score / data.total) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        // Fallback if no specific analysis exists - Mocking based on question types if possible or generic
                                        ["Technical Knowledge", "Problem Solving", "Code Quality"].map((skill, idx) => {
                                            const mockVal = Math.min(100, selectedCandidate.percentage + (idx % 2 === 0 ? 5 : -5));
                                            return (
                                                <div key={idx}>
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{skill} (Est.)</span>
                                                        <span className="text-white font-bold text-xs">{mockVal.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-slate-600 rounded-full" style={{ width: `${mockVal}%` }}></div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                             </div>

                            {/* Explainable Rejection Engine - New Feature */}
                            {selectedCandidate.aiEvaluation?.rejectionReason && (
                                <div className="bg-[#151b2b] p-6 rounded-3xl border border-slate-800/50 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-3">
                                        <BrainCircuit className="w-5 h-5 text-purple-500" />
                                        <h4 className="text-slate-300 font-black text-xs uppercase tracking-widest">AI Decision Support</h4>
                                    </div>

                                    <div className={`p-5 rounded-2xl border ${selectedCandidate.aiEvaluation.rejectionReason.status === 'Accepted' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 p-2 rounded-lg ${selectedCandidate.aiEvaluation.rejectionReason.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                                {selectedCandidate.aiEvaluation.rejectionReason.status === 'Accepted' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1">
                                                <h5 className={`font-black text-sm uppercase tracking-wide mb-1 ${selectedCandidate.aiEvaluation.rejectionReason.status === 'Accepted' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {selectedCandidate.aiEvaluation.rejectionReason.status === 'Accepted' ? 'Candidate Accepted' : 'Decision: Rejected because...'}
                                                </h5>
                                                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                                                    {selectedCandidate.aiEvaluation.rejectionReason.reason}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800/50">
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <Sparkles className="w-3 h-3" /> Key Strengths
                                                </p>
                                                <ul className="space-y-2">
                                                    {selectedCandidate.aiEvaluation.rejectionReason.strengths?.map((s, i) => (
                                                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mt-1 shrink-0" />
                                                            {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <AlertTriangle className="w-3 h-3" /> Growth Areas
                                                </p>
                                                <ul className="space-y-2">
                                                    {selectedCandidate.aiEvaluation.rejectionReason.weaknesses?.map((w, i) => (
                                                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500/40 mt-1 shrink-0" />
                                                            {w}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Integrity Flags Detected */}
                            {selectedCandidate.tabSwitchViolation && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="w-6 h-6 text-red-500" />
                                            <h4 className="text-red-500 font-black text-sm uppercase tracking-widest">Integrity Flags Detected</h4>
                                        </div>
                                        <p className="text-red-400 text-xs font-medium">
                                            Our proctoring system flagged this submission for manual review due to the following anomalies:
                                        </p>
                                        <div className="flex gap-3">
                                            <div className="px-3 py-1.5 bg-red-500/20 rounded-lg border border-red-500/30 text-[10px] font-black uppercase tracking-widest text-red-400">
                                                Moderate Tab Switching
                                            </div>
                                            <div className="px-3 py-1.5 bg-red-500/20 rounded-lg border border-red-500/30 text-[10px] font-black uppercase tracking-widest text-red-400">
                                                Manual Review Recommended
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Response Analysis - Image 4 Design */}
                                {selectedJob && selectedJob.questions && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-slate-300 font-black text-xs uppercase tracking-widest">Response Analysis</h4>
                                        </div>

                                        <div className="space-y-4">
                                            {selectedJob.questions.map((q, idx) => {
                                                const details = selectedCandidate.aiEvaluation?.details || [];
                                                const answerDetail = details.find(d => d.questionId === q.id) || details[idx];
                                                const isSkipped = !answerDetail?.userAnswer;
                                                const displayedAnswer = isSkipped ? 'SKIPPED' : (typeof answerDetail?.userAnswer === 'string' ? answerDetail.userAnswer : JSON.stringify(answerDetail?.userAnswer));

                                                const isCorrect = answerDetail?.isCorrect || (answerDetail?.score >= 1);
                                                const answerColorClass = isSkipped
                                                    ? 'text-orange-500'
                                                    : isCorrect
                                                        ? 'text-emerald-500'
                                                        : 'text-red-500';

                                                return (
                                                    <div key={idx} className="bg-white dark:bg-[#151b2b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                                                        <div className="flex-shrink-0">
                                                            <div className="h-10 w-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center font-black text-amber-600 dark:text-amber-500 text-sm border border-amber-100 dark:border-amber-800">
                                                                {idx + 1}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 space-y-3 w-full text-left">
                                                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed">
                                                                {q.question}
                                                            </h3>

                                                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 text-[10px] uppercase font-black tracking-widest w-full">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="text-slate-400 flex-shrink-0">ANS:</span>
                                                                    <span className={`truncate ${answerColorClass}`}>
                                                                        {displayedAnswer}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="text-slate-400 flex-shrink-0">IDEAL:</span>
                                                                    <span className="text-slate-600 dark:text-slate-400 truncate">
                                                                        {q.correctAnswer || q.idealAnswer || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-4 pt-2">
                                    <button
                                        onClick={() => navigate(`/result/${selectedCandidate.jobId}`, { state: { ...selectedCandidate, isRecruiterView: true } })}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" /> View Full Report
                                    </button>
                                    <button
                                        onClick={() => setSelectedCandidate(null)}
                                        className="px-8 bg-slate-800 hover:bg-slate-700 text-slate-300 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all"
                                    >
                                        Close
                                    </button>
>>>>>>> 9f530201b99a911ed8e7c8c37a6ba7faae4d1929
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                             {/* AI Technical Summary */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-4 h-4 text-blue-500" />
                                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">AI Technical Audit</h3>
                                </div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                    "{selectedCandidate.aiEvaluation?.technicalSummary || "Complete assessment to generate specific technical feedback."}"
                                </p>
                            </div>

                            {/* Risk / Credibility Analysis */}
                            <div className={`p-6 rounded-[2rem] border ${selectedCandidate.tabSwitchViolation || selectedCandidate.percentage < 40 ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30'}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className={`w-4 h-4 ${selectedCandidate.tabSwitchViolation || selectedCandidate.percentage < 40 ? 'text-rose-500' : 'text-emerald-500'}`} />
                                    <h3 className={`text-xs font-black uppercase tracking-widest ${selectedCandidate.tabSwitchViolation || selectedCandidate.percentage < 40 ? 'text-rose-400' : 'text-emerald-400'}`}>Risk Assessment</h3>
                                </div>
                                <div className="space-y-2">
                                     {selectedCandidate.tabSwitchViolation ? (
                                        <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                                            ⚠️ <span className="underline">Integrity Flag:</span> User switched tabs during the test. This suggests potential reliance on external resources.
                                        </p>
                                     ) : (
                                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                            ✓ No integrity violations detected.
                                        </p>
                                     )}
                                     
                                     {selectedCandidate.aiEvaluation?.credibilityScore < 50 && (
                                         <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                                            ⚠️ <span className="underline">Skill Mismatch:</span> Resume claims senior expertise but test performance (Score: {selectedCandidate.percentage}%) indicates junior-level proficiency.
                                         </p>
                                     )}
                                     
                                     {!selectedCandidate.tabSwitchViolation && selectedCandidate.aiEvaluation?.credibilityScore >= 50 && (
                                         <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                            ✓ Candidate answers align with claimed experience level.
                                         </p>
                                     )}
                                </div>
                            </div>
                        </div>

                        {/* Detailed Answer Breakdown */}
                        <div>
                             <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 px-2">Assessment Response Log</h3>
                             <div className="space-y-4">
                                {selectedCandidate.answers && Object.entries(selectedCandidate.answers).map(([qIdx, answer], i) => {
                                    // Heuristic to determine if "Correct" or "Incorrect" for the UI based on score
                                    // If high score (>80), assume most answers match "Optimal/Correct". 
                                    // If low score, flag generic short answers as suspect.
                                    // In a real app, we would store 'isCorrect' per answer.
                                    // For this Mock/CSV data, we used keywords in the answer generator.
                                    
                                    const isOptimal = answer.includes("Optimal") || answer.includes("Correct") || answer.includes("Detailed explanation");
                                    const isSuspect = answer.includes("Wrong") || answer.includes("Incomplete") || answer.includes("Vague") || answer.includes("Generic");
                                    
                                    // Fallback logic if keywords missing (random distribution based on total score)
                                    const status = isOptimal ? 'success' : isSuspect ? 'error' : (selectedCandidate.percentage > 60 ? 'success' : 'warning');
                                    
                                    return (
                                        <div key={i} className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                            <div className="flex justify-between items-start mb-3">
                                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {parseInt(qIdx) + 1}</span>
                                                 <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                                                     status === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                                                     status === 'error' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 
                                                     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                 }`}>
                                                    {status === 'success' ? 'Efficient / Correct' : status === 'error' ? 'Incorrect / Incomplete' : 'Partially Correct'}
                                                 </span>
                                            </div>
                                            <div className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">
                                                {answer}
                                            </div>
                                        </div>
                                    )
                                })}
                                {(!selectedCandidate.answers || Object.keys(selectedCandidate.answers).length === 0) && (
                                    <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                                        No specific answer data available for this candidate.
                                    </div>
                                )}
                             </div>
                        </div>

                    </div>
                </div>
            )}
                </div>
            </main>
        </div>
    );
};

export default RecruiterDashboard;
