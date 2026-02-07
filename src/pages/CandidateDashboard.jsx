import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import Sidebar from '../components/Sidebar';
import {
    Briefcase, Play, Clock, Layout, Loader,
    LogOut, FileText, CheckCircle, Search,
    Sparkles, ArrowRight, Zap, Trophy,
    Bell, ChevronRight, User, Upload,
    AlertCircle, FileCheck
} from 'lucide-react';

const CandidateDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || null);
    const [resumeName, setResumeName] = useState(user?.resumeName || null);

    useEffect(() => {
        const fetchJobs = async () => {
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

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert("File too large. Max 5MB allowed.");
            return;
        }

        setUploading(true);
        try {
            const storageRef = ref(storage, `resumes/${user.uid}/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            // Update user document
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                resumeUrl: url,
                resumeName: file.name,
                resumeUploadedAt: new Date().toISOString()
            });

            setResumeUrl(url);
            setResumeName(file.name);
            alert("Resume uploaded successfully!");
        } catch (error) {
            console.error("Error uploading resume:", error);
            alert("Failed to upload resume.");
        }
        setUploading(false);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] dark:bg-[#0f172a] text-slate-900 font-sans selection:bg-blue-100 transition-colors duration-200">
            {/* Sidebar */}
            <Sidebar
                role="candidate"
                user={user}
                onLogout={handleLogout}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0 z-10 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Candidate Portal</p>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                Explorer Dashboard <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" /> <span className="text-blue-600 underline underline-offset-4 decoration-2">Opportunities</span>
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{user?.email?.split('@')[0]}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Certified Candidate</p>
                            </div>
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth dark:bg-slate-950">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Upper Section: Hero & Resume */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Hero Card */}
                            <div className="lg:col-span-2 relative p-10 rounded-[3rem] bg-slate-900 dark:bg-[#1e293b] text-white overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-blue-500/10 group">
                                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none"></div>
                                <Sparkles className="absolute -right-8 -top-8 w-48 h-48 text-white/5 opacity-50 group-hover:rotate-12 transition-transform duration-1000" />

                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30 mb-6">
                                        <Zap className="w-3 h-3" /> System Status: Online
                                    </div>
                                    <h1 className="text-4xl font-black uppercase tracking-tight mb-4 leading-[0.9]">
                                        Prove Your <span className="text-blue-500">Expertise</span>.
                                    </h1>
                                    <p className="text-slate-400 font-medium text-lg mb-8 leading-relaxed max-w-xl">
                                        Browse active job missions and complete assessments to get verified skill reports.
                                    </p>
                                    {!resumeUrl && (
                                        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl max-w-md">
                                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                            <p className="text-xs font-bold text-amber-200 uppercase tracking-tight">
                                                Resume missing! Upload your resume to enable AI Skill Matching.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Resume Upload Card */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Talent Passport</h3>
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                    </div>

                                    {resumeUrl ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
                                                <div className="p-3 bg-emerald-600 text-white rounded-xl">
                                                    <FileCheck className="w-5 h-5" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">{resumeName || 'Resume.pdf'}</p>
                                                    <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Verified & Secure</p>
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed text-center px-4">
                                                AI is actively syncing your resume credentials with development patterns.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                <Upload className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Upload Resume</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">PDF / DOCX (Max 5MB)</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8">
                                    <label className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.98] cursor-pointer ${uploading ? 'bg-slate-100 text-slate-400 pointer-events-none' :
                                            resumeUrl ? 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700' :
                                                'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                                        }`}>
                                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={uploading} />
                                        {uploading ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={18} />
                                                {resumeUrl ? 'Update Resume' : 'Choose File'}
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Assessments Section */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                            {/* Left: Jobs List */}
                            <div className="xl:col-span-8 space-y-6">
                                <div className="flex items-center justify-between mb-2 px-2">
                                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Open Assessments</h3>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input type="text" placeholder="Search Missions..." className="bg-white dark:bg-slate-900 pl-10 pr-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 w-48 sm:w-64 transition-all" />
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="bg-white dark:bg-slate-900 p-20 rounded-[3rem] border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                                        <Loader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Job Feed...</p>
                                    </div>
                                ) : jobs.length === 0 ? (
                                    <div className="bg-white dark:bg-slate-900 p-20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6">
                                            <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Missions Available</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tight mt-2 max-w-xs mx-auto">Check back later or refine your preferences.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {jobs.map((job) => (
                                            <div key={job.id} className="group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-blue-600 transition-all group-hover:text-white text-blue-600 shadow-sm">
                                                        <Briefcase className="w-6 h-6" />
                                                    </div>
                                                    <span className={`px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50`}>
                                                        Active
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{job.title}</h3>
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-6 line-clamp-2 leading-relaxed">
                                                    {job.description}
                                                </p>

                                                <div className="flex items-center gap-4 mb-8">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">15 Mins</span>
                                                    </div>
                                                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                                                    <div className="flex items-center gap-1.5">
                                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.questions?.length || 0} Items</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => navigate(`/test/${job.id}`)}
                                                    className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                                                >
                                                    Access Assessment
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Stats Area */}
                            <div className="xl:col-span-4 space-y-8">
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-8 px-2">Skill Overview</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Trophy className="w-4 h-4" /></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Avg. Score</span>
                                            </div>
                                            <span className="text-lg font-black text-slate-900 dark:text-white">--</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><CheckCircle className="w-4 h-4" /></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Completed</span>
                                            </div>
                                            <span className="text-lg font-black text-slate-900 dark:text-white">0</span>
                                        </div>
                                    </div>
                                    <button className="w-full mt-8 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all">Download Passport</button>
                                </div>

                                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                                    <BrainCircuit className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 opacity-50 group-hover:scale-110 transition-transform duration-1000" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6">AI Insights</p>
                                    <p className="text-sm font-bold uppercase tracking-tight leading-relaxed mb-6">
                                        Candidates with uploaded resumes are <span className="text-white underline decoration-blue-500">3x more likely</span> to be indexed by hiring algorithms.
                                    </p>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CandidateDashboard;
