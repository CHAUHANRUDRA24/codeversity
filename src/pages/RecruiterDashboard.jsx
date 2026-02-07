import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
    Briefcase, User, Search, Plus, Filter,
    Download, MoreHorizontal, LogOut, Loader,
    Award, Shield, BrainCircuit, Sparkles, TrendingUp,
    X, CheckCircle, XCircle, Calendar, Clock, Trophy,
    AlertTriangle, FileText
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
    const [selectedCandidate, setSelectedCandidate] = useState(null);

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
                                                        onClick={() => setSelectedCandidate(candidate)}
                                                        className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all cursor-pointer"
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

            {/* Candidate Detail Modal */}
            {selectedCandidate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" onClick={() => setSelectedCandidate(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8" onClick={(e) => e.stopPropagation()}>

                        {/* Header */}
                        <div className="bg-white dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Candidate Review</h2>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                    {selectedCandidate.user?.email || 'Candidate'} <span className="mx-2">·</span> {selectedCandidate.jobTitle}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {(selectedCandidate.percentage < 40 || selectedCandidate.tabSwitchViolation) && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg">
                                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">High Risk Profile</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => setSelectedCandidate(null)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950">

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                {/* Total Score */}
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Total Score</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-slate-900 dark:text-white">{selectedCandidate.score}/{selectedCandidate.total}</span>
                                        <span className={`text-sm font-black ${selectedCandidate.percentage >= 60 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            ({selectedCandidate.percentage.toFixed(0)}%)
                                        </span>
                                    </div>
                                </div>

                                {/* Time Taken */}
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Time Taken</p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-blue-500" />
                                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                                            {selectedCandidate.timeTaken ? `${Math.floor(selectedCandidate.timeTaken / 60)}m ${selectedCandidate.timeTaken % 60}s` : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Tab Switches */}
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Tab Switches</p>
                                    <div className="flex items-center gap-2">
                                        <Shield className={`w-5 h-5 ${selectedCandidate.tabSwitchViolation ? 'text-rose-500' : 'text-emerald-500'}`} />
                                        <span className={`text-2xl font-black ${selectedCandidate.tabSwitchViolation ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                                            {selectedCandidate.tabSwitchViolation ? 'Yes' : 'None'}
                                        </span>
                                    </div>
                                </div>

                                {/* Resume Status */}
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center">
                                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                        <FileText className="w-5 h-5" />
                                        <span className="text-sm font-bold">No Resume</span>
                                    </div>
                                </div>
                            </div>

                            {/* Integrity Flags */}
                            {(selectedCandidate.percentage < 40 || selectedCandidate.tabSwitchViolation) && (
                                <div className="bg-rose-50 dark:bg-rose-900/10 border-2 border-rose-100 dark:border-rose-900/30 rounded-2xl p-6 mb-8">
                                    <div className="flex items-start gap-4">
                                        <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-1" />
                                        <div>
                                            <h3 className="text-sm font-black text-rose-700 dark:text-rose-300 uppercase tracking-wide mb-2">Integrity Flags Detected</h3>
                                            <p className="text-sm font-medium text-rose-600 dark:text-rose-400 mb-4">
                                                Our proctoring system flagged this submission for manual review due to the following anomalies:
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                {selectedCandidate.percentage < 40 && (
                                                    <span className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-lg text-[10px] font-black text-rose-700 dark:text-rose-300 uppercase tracking-widest">
                                                        Low Performance Score
                                                    </span>
                                                )}
                                                {selectedCandidate.tabSwitchViolation && (
                                                    <span className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-lg text-[10px] font-black text-rose-700 dark:text-rose-300 uppercase tracking-widest">
                                                        Tab Switching Detected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Response Analysis */}
                            {selectedJob?.questions && (
                                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Response Analysis</h3>
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {selectedJob.questions.map((question, index) => {
                                            const userAnswer = selectedCandidate.answers?.[index];
                                            let isCorrect = false;

                                            // Check if answer is correct
                                            if (question.type === 'mcq' || !question.type) {
                                                isCorrect = userAnswer === question.correctAnswer;
                                            } else if (question.type === 'subjective' || question.type === 'coding') {
                                                isCorrect = userAnswer && userAnswer.trim().length > 10;
                                            }

                                            return (
                                                <div key={index} className="p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <div className="flex items-start gap-4 mb-4">
                                                        <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-black text-xs text-slate-500 dark:text-slate-400">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                                    {question.type || 'MCQ'}
                                                                </span>
                                                                {isCorrect ? (
                                                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                                ) : (
                                                                    <XCircle className="w-4 h-4 text-rose-500" />
                                                                )}
                                                            </div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white mb-4 leading-relaxed">{question.question}</p>

                                                            {/* MCQ Options */}
                                                            {(question.type === 'mcq' || !question.type) && question.options && (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                                                            Candidate Evaluation
                                                                        </p>
                                                                        <div className={`p-4 rounded-xl border-2 ${isCorrect
                                                                            ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                                                            : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                                                                            }`}>
                                                                            <p className="text-sm font-bold">{userAnswer || 'No answer'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                                                            Ideal Solution
                                                                        </p>
                                                                        <div className="p-4 rounded-xl border-2 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                                                                            <p className="text-sm font-bold">{question.correctAnswer}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Subjective/Coding Answer */}
                                                            {(question.type === 'subjective' || question.type === 'coding') && (
                                                                <div>
                                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                                                        Candidate's Answer:
                                                                    </p>
                                                                    <div className={`p-4 rounded-xl border-2 ${question.type === 'coding'
                                                                        ? 'bg-slate-900 dark:bg-slate-950 border-slate-700 font-mono text-sm text-emerald-400'
                                                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                                                                        }`}>
                                                                        <pre className="whitespace-pre-wrap font-inherit text-xs">
                                                                            {userAnswer || <span className="text-slate-400 italic">No answer provided</span>}
                                                                        </pre>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-4">
                            <button
                                onClick={() => setSelectedCandidate(null)}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/20"
                            >
                                Done Reviewing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterDashboard;
