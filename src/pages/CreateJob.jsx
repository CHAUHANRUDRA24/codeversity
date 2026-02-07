import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateQuestions } from '../utils/generateQuestions';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import {
    Briefcase,
    ChevronRight,
    Check,
    Layout,
    Plus,
    User,
    LogOut,
    Search,
    Bell,
    Clock,
    FileText,
    ArrowLeft,
    Sparkles,
    Zap,
    Target,
    Users,
    ChevronDown,
    Save,
    CheckCircle,
    BrainCircuit,
    Loader
} from 'lucide-react';

const CreateJob = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('Mid Level');

    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // AI Handler
    const handleGenerateValues = () => {
        if (!jobTitle || !jobDescription) {
            alert("Please fill in Job Title and Description first.");
            return;
        }

        setIsGenerating(true);

        // Simulate AI thinking time for UX
        setTimeout(() => {
            const questions = generateQuestions(jobDescription, jobTitle);
            setGeneratedQuestions(questions);
            setIsGenerating(false);
        }, 1500);
    };

    const handlePublish = async () => {
        if (generatedQuestions.length === 0) return;

        setIsPublishing(true);
        try {
            if (auth.currentUser) {
                await addDoc(collection(db, "jobs"), {
                    title: jobTitle,
                    description: jobDescription,
                    experienceLevel,
                    questions: generatedQuestions, // The generated MCQs
                    createdBy: auth.currentUser.uid,
                    createdAt: serverTimestamp(),
                    status: 'active'
                });
                navigate('/recruiter-dashboard');
            } else {
                alert("User not authenticated");
            }
        } catch (error) {
            console.error("Error creating job:", error);
            alert("Failed to publish job. See console.");
        }
        setIsPublishing(false);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] dark:bg-[#0f172a] text-slate-900 font-sans selection:bg-blue-100 transition-colors duration-200">
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
                <header className="h-20 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0 z-10 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Recruiter Dashboard</p>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                Job Creation Wizard <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" /> <span className="text-blue-600">Configuration</span>
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/recruiter-dashboard')}
                            className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing || generatedQuestions.length === 0}
                            className="flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-200 dark:shadow-none active:scale-95 disabled:opacity-50 disabled:scale-100"
                        >
                            {isPublishing ? (
                                <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            {isPublishing ? 'Synthesizing...' : 'Launch Assessment'}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth dark:bg-slate-950">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Left: Input Form */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all duration-200">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Define the Mission</h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-[0.1em]">Craft a description, and we'll engineer the assessment.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Job Title</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                <Briefcase className="h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                            </div>
                                            <input
                                                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                                                placeholder="e.g. Senior Frontend Engineer"
                                                type="text"
                                                value={jobTitle}
                                                onChange={(e) => setJobTitle(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Experience Level</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                <Zap className="h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                            </div>
                                            <select
                                                className="w-full h-14 pl-12 pr-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none appearance-none cursor-pointer"
                                                value={experienceLevel}
                                                onChange={(e) => setExperienceLevel(e.target.value)}
                                            >
                                                <option>Fresher (0-2 years)</option>
                                                <option>Mid Level (2-5 years)</option>
                                                <option>Senior Level (5+ years)</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                                <ChevronDown className="h-5 w-5 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Job Description</label>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${jobDescription.length > 4000 ? 'text-red-500' : 'text-slate-300 dark:text-slate-600'}`}>{jobDescription.length.toLocaleString()} / 5,000</span>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute top-4 left-4 pointer-events-none">
                                                <FileText className="h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                            </div>
                                            <textarea
                                                className="w-full h-80 pl-12 pr-6 py-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none resize-none leading-relaxed"
                                                placeholder="Paste the job description here. We will analyze keywords like 'React', 'Python', etc."
                                                value={jobDescription}
                                                onChange={(e) => setJobDescription(e.target.value)}
                                            ></textarea>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGenerateValues}
                                        disabled={isGenerating || !jobTitle || !jobDescription}
                                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                Analyzing Skills...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={18} />
                                                Generate AI Assessment
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Preview Area */}
                        <div className="space-y-6">
                            {/* Empty State */}
                            {generatedQuestions.length === 0 && !isGenerating && (
                                <div className="h-full min-h-[500px] bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center text-slate-500 dark:text-slate-400 transition-all duration-200">
                                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6">
                                        <BrainCircuit size={48} className="text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">AI Output Terminal</h3>
                                    <p className="max-w-xs mt-3 text-xs font-bold uppercase tracking-tight leading-relaxed">Fill out the job details and click Generate to see the AI-curated screening questions previewed here.</p>
                                </div>
                            )}

                            {isGenerating && (
                                <div className="h-full min-h-[500px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center p-12 text-center transition-all duration-200">
                                    <div className="w-20 h-20 border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-600 rounded-full animate-spin mb-8"></div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Generating Questions</h3>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 animate-pulse">Scanning keywords and formatting schema...</p>
                                </div>
                            )}

                            {/* Questions List */}
                            {generatedQuestions.length > 0 && !isGenerating && (
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 flex flex-col max-h-[calc(100vh-140px)] transition-all duration-200">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-shrink-0">
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Generated Questions</h3>
                                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">AI-Powered Assessment Preview</p>
                                        </div>
                                        <span className="bg-blue-600 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                                            {generatedQuestions.length} Items
                                        </span>
                                    </div>

                                    <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto p-0 scrollbar-hide">
                                        {generatedQuestions.map((q, idx) => (
                                            <div key={idx} className="p-8 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <div className="flex gap-4">
                                                    <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg">
                                                        {idx + 1}
                                                    </span>
                                                    <div className="w-full">
                                                        <p className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight leading-relaxed">{q.question}</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {q.options.map((opt, i) => (
                                                                <div key={i} className={`text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-xl border ${opt === q.correctAnswer ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                                                    {opt}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-8 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                                        <button
                                            onClick={handlePublish}
                                            disabled={isPublishing}
                                            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                                        >
                                            {isPublishing ? (
                                                <>
                                                    <Loader className="w-5 h-5 animate-spin" />
                                                    Finalizing...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle size={20} />
                                                    Launch Live Assessment
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Footer Spacer */}
                    <div className="h-20"></div>
                </div>
            </main>
        </div>
    );
};

export default CreateJob;
