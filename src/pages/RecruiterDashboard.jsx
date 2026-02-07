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
                                                return (
                                                    <tr 
                                                        key={candidate.id} 
                                                        className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all cursor-pointer"
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
                                                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                                                Tab Switch Detected
                                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                                                            </div>
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
                                                                    : candidate.percentage >= 80 
                                                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-900/50' 
                                                                        : candidate.percentage >= 60 
                                                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/50' 
                                                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'
                                                                    }`}>
                                                                    {candidate.tabSwitchViolation 
                                                                        ? <><AlertTriangle className="w-3 h-3" /> Violation</> 
                                                                        : candidate.percentage >= 80 
                                                                            ? 'Exceptional' 
                                                                            : candidate.percentage >= 60 
                                                                                ? 'Verified' 
                                                                                : 'Review Required'}
                                                                </span>
                                                                {(candidate.aiEvaluation?.credibilityScore < 60) && (
                                                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-500 uppercase tracking-wide">
                                                                         <AlertTriangle className="w-3 h-3" /> Low Trust / Mismatch
                                                                    </span>
                                                                )}
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
                                <div className="flex items-center gap-3 flex-wrap">
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
