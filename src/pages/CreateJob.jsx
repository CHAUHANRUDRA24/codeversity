import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateQuestions } from '../utils/generateQuestions';
import { useAuth } from '../context/AuthContext';
import { Sparkles, CheckCircle, BrainCircuit } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const CreateJob = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // Added logout

    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('Mid Level');

    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar

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
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f7f8] dark:bg-[#101822] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-200">
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
                <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#1a2432] border-b border-slate-200 dark:border-slate-800 shrink-0 z-10 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-0.5">
                                <span onClick={() => navigate('/recruiter-dashboard')} className="hover:text-blue-600 cursor-pointer transition-colors">Dashboard</span>
                                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                <span className="text-slate-900 dark:text-white font-medium">New Assessment</span>
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Create Job</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/recruiter-dashboard')} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            Cancel
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Left: Input Form */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-[#1a2432] p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Job Details</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 dark:text-white outline-none transition-shadow"
                                            placeholder="e.g. Senior Frontend Engineer"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Experience Level</label>
                                        <select
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 dark:text-white outline-none transition-shadow"
                                            value={experienceLevel}
                                            onChange={(e) => setExperienceLevel(e.target.value)}
                                        >
                                            <option>Fresher (0-2 years)</option>
                                            <option>Mid Level (2-5 years)</option>
                                            <option>Senior Level (5+ years)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Description</label>
                                        <textarea
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-40 text-sm text-slate-900 dark:text-white outline-none transition-shadow"
                                            placeholder="Paste the job description here. We will analyze keywords like 'React', 'Python', etc."
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                        />
                                        <p className="text-xs text-slate-400 mt-2 text-right">{jobDescription.length} chars</p>
                                    </div>

                                    <button
                                        onClick={handleGenerateValues}
                                        disabled={isGenerating || !jobTitle || !jobDescription}
                                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Analyzing Skills...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} />
                                                Generate AI Assessment
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Preview & Publish */}
                        <div className="space-y-6">
                            {/* Empty State */}
                            {generatedQuestions.length === 0 && !isGenerating && (
                                <div className="h-full min-h-[400px] bg-white dark:bg-[#1a2432] border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 transition-colors duration-200">
                                    <BrainCircuit size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">AI Preview Area</h3>
                                    <p className="max-w-xs mt-2 text-sm">Fill out the job details and click Generate to see the AI-curated screening questions previewed here.</p>
                                </div>
                            )}

                            {isGenerating && (
                                <div className="h-full min-h-[400px] bg-white dark:bg-[#1a2432] border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center transition-colors duration-200">
                                    <div className="w-12 h-12 border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Generating Questions</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Scanning keywords and formatting schema...</p>
                                </div>
                            )}

                            {/* Questions List */}
                            {generatedQuestions.length > 0 && !isGenerating && (
                                <div className="bg-white dark:bg-[#1a2432] rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 flex flex-col max-h-[calc(100vh-140px)] transition-colors duration-200">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 px-6 py-4 border-b border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center flex-shrink-0">
                                        <div>
                                            <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Generated Questions</h3>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-300">Based on analysis of {jobDescription.length} chars</p>
                                        </div>
                                        <span className="bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded text-xs font-bold shadow-sm">
                                            {generatedQuestions.length} Questions
                                        </span>
                                    </div>

                                    <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto p-0">
                                        {generatedQuestions.map((q, idx) => (
                                            <div key={idx} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <div className="flex gap-3">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs font-bold mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <div className="w-full">
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">{q.question}</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {q.options.map((opt, i) => (
                                                                <div key={i} className={`text-xs px-3 py-2 rounded border ${opt === q.correctAnswer ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400 font-medium' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                                                    {opt}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                                        <button
                                            onClick={handlePublish}
                                            disabled={isPublishing}
                                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-emerald-200/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                                        >
                                            {isPublishing ? 'Publishing...' : (
                                                <>
                                                    <CheckCircle size={20} />
                                                    Publish Live Assessment
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateJob;
