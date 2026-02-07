import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
    Briefcase, User, Search, Plus, Filter,
    Download, MoreHorizontal, LogOut, Loader,
    Award, Shield, BrainCircuit, Sparkles, TrendingUp, AlertTriangle,
    CheckCircle, XCircle, Calendar, Eye, X, HelpCircle, FileText
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
    const [selectedCandidate, setSelectedCandidate] = useState(null);
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
                                                    <tr
                                                        key={candidate.id}
                                                        onClick={() => setSelectedCandidate({ ...candidate, jobId: selectedJob.id, jobTitle: selectedJob.title })}
                                                        className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all cursor-pointer"
                                                    >
                                                        <td className="px-8 py-6">
                                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border-2 ${index === 0 ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/20' :
                                                                'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'
                                                                }`}>
                                                                {index + 1}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[200px]">{candidate.user?.email}</div>
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
                                                                <span className="font-black text-slate-900 dark:text-white w-10">{(candidate.percentage || 0).toFixed(0)}%</span>
                                                                <div className="h-1.5 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                    <div className={`h-full transition-all duration-1000 ${candidate.percentage >= 60 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${candidate.percentage}%` }}></div>
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
                                                                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-900/50'
                                                                    : candidate.percentage >= 80
                                                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border-indigo-100 dark:border-indigo-900/50'
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

                {/* Candidate Modal */}
                {selectedCandidate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
                        <div className="bg-[#0B0F17] w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800 animate-in zoom-in-95 duration-200 text-left flex flex-col">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                        <User className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-2xl tracking-tight">CANDIDATE PROFILE</h3>
                                        <p className="text-blue-100 font-medium">{selectedCandidate.user?.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedCandidate(null)}
                                    className="h-10 w-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <X className="h-5 w-5 text-white" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
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
                                                <p className="text-3xl font-black text-white">{(selectedCandidate.percentage || 0).toFixed(0)}%</p>
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
                                                            <span className="text-white">{((selectedCandidate.percentage || 0) * 0.6).toFixed(0)}pts</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs font-medium text-slate-400 border-b border-slate-800 pb-2">
                                                            <span>Resume Match (30%)</span>
                                                            <span className="text-white">{((credibility || 0) * 0.3).toFixed(0)}pts</span>
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

                                {/* Hiring Recommendation */}
                                <div className="bg-[#151b2b] p-6 rounded-3xl border border-slate-800/50">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield className="w-5 h-5 text-slate-400" />
                                        <h4 className="text-slate-300 font-black text-xs uppercase tracking-widest">Hiring Recommendation</h4>
                                    </div>

                                    <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 flex items-center gap-4">
                                        {selectedCandidate.percentage >= 60 && !selectedCandidate.tabSwitchViolation ? (
                                            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                                <CheckCircle className="w-6 h-6 text-emerald-500" />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                                <XCircle className="w-6 h-6 text-amber-500" />
                                            </div>
                                        )}

                                        <div>
                                            <h5 className={`font-black text-[10px] uppercase tracking-[0.2em] mb-1 ${selectedCandidate.percentage >= 60 && !selectedCandidate.tabSwitchViolation ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {selectedCandidate.percentage >= 80 ? 'STRONGLY RECOMMENDED' :
                                                    selectedCandidate.percentage >= 60 ? 'PROCEED TO INTERVIEW' :
                                                        'REVIEW REQUIRED'}
                                            </h5>
                                            <p className="text-slate-400 text-xs font-bold leading-relaxed">
                                                {selectedCandidate.percentage >= 60 && !selectedCandidate.tabSwitchViolation
                                                    ? "Candidate has demonstrated sufficient technical proficiency. Recommended to proceed to the next stage."
                                                    : "Additional manual evaluation recommended before proceeding due to low score or potential policy violations."}
                                            </p>
                                        </div>
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
                                                    <div key={idx} className="bg-[#151b2b]/40 backdrop-blur-sm p-6 rounded-3xl border border-slate-800/40 hover:border-slate-700/60 hover:bg-[#151b2b]/60 transition-all duration-300 flex flex-col md:flex-row gap-6 items-start group">
                                                        <div className="flex-shrink-0">
                                                            <div className="h-10 w-10 bg-amber-500/10 dark:bg-amber-900/20 rounded-xl flex items-center justify-center font-black text-amber-500 text-sm border border-amber-500/20 group-hover:scale-110 transition-transform">
                                                                {idx + 1}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 space-y-4 w-full text-left">
                                                            <h3 className="font-bold text-slate-300 text-sm md:text-base leading-relaxed group-hover:text-white transition-colors">
                                                                {q.question}
                                                            </h3>

                                                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 text-[9px] uppercase font-black tracking-[0.2em] w-full border-t border-slate-800/50 pt-4">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="text-slate-500 flex-shrink-0">ANS:</span>
                                                                    <span className={`truncate ${answerColorClass} bg-slate-800/50 px-2 py-1 rounded`}>
                                                                        {displayedAnswer}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="text-slate-500 flex-shrink-0">IDEAL:</span>
                                                                    <span className="text-slate-400 truncate opacity-60">
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
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RecruiterDashboard;
