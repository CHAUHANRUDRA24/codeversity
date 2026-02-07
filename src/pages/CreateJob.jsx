import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateAssessmentFromJD } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { Sparkles, CheckCircle, BrainCircuit, Code, FileText, CheckSquare, X, AlertOctagon } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const CreateJob = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('Mid Level');

    // State for the structured questions from generator
    const [generatedSections, setGeneratedSections] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState(null);

    // AI Handler
    const handleGenerateValues = async () => {
        if (!jobTitle || !jobDescription) {
            alert("Please fill in Job Title and Description first.");
            return;
        }

        setIsGenerating(true);
        setGeneratedSections(null);
        setError(null);

        try {
            const sections = await generateAssessmentFromJD(jobTitle, jobDescription, experienceLevel);
            setGeneratedSections(sections);
        } catch (err) {
            console.error(err);
            setError("Failed to generate assessment. Please check your API Key or try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePublish = async () => {
        if (!generatedSections) return;

        setIsPublishing(true);
        try {
            if (auth.currentUser) {
                // Flatten questions for Firestore with types & IDs
                const finalQuestions = [
                    ...generatedSections.mcqs.map(q => ({ ...q, type: 'mcq', id: Math.random().toString(36).substr(2, 9) })),
                    ...generatedSections.subjective.map(q => ({ question: q, type: 'subjective', id: Math.random().toString(36).substr(2, 9) })),
                    ...generatedSections.coding.map(q => ({ ...q, type: 'coding', id: Math.random().toString(36).substr(2, 9) }))
                ];

                await addDoc(collection(db, "jobs"), {
                    title: jobTitle,
                    description: jobDescription,
                    experienceLevel,
                    questions: finalQuestions,
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
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Assessment Generator</p>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Create New Assessment</h1>
                    </div>
                    <button onClick={() => navigate('/recruiter-dashboard')} className="flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all uppercase tracking-widest">
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8 space-y-8 scroll-smooth transition-colors duration-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Left: Input Form */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Job Details</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Job Title</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all"
                                            placeholder="e.g. Senior Frontend Engineer"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Experience Level</label>
                                        <select
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 text-sm font-medium text-slate-900 dark:text-white transition-all"
                                            value={experienceLevel}
                                            onChange={(e) => setExperienceLevel(e.target.value)}
                                        >
                                            <option>Fresher (0-2 years)</option>
                                            <option>Mid Level (2-5 years)</option>
                                            <option>Senior Level (5+ years)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Job Description</label>
                                        <textarea
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 h-40 text-sm font-medium text-slate-900 dark:text-white resize-none transition-all"
                                            placeholder="Paste the job description here. We will analyze keywords like 'React', 'Python', etc."
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                        />
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-right font-bold">{jobDescription.length} chars</p>
                                    </div>

                                    <button
                                        onClick={handleGenerateValues}
                                        disabled={isGenerating || !jobTitle || !jobDescription}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
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
                            {!generatedSections && !isGenerating && (
                                <div className="h-full min-h-[400px] bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center">
                                    <BrainCircuit size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">AI Preview Area</h3>
                                    <p className="max-w-xs mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">Fill out the job details and click Generate to see the AI-curated screening questions previewed here.</p>
                                </div>
                            )}

                            {isGenerating && (
                                <div className="h-full min-h-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center">
                                    <div className="w-12 h-12 border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mb-4"></div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Generating Questions</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Analyzing JD context and designing challenges...</p>
                                    <div className="flex gap-2 mt-4 text-xs text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest">
                                        <span>Gemini AI</span> • <span>Custom Schema</span>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-xl flex items-center gap-3">
                                    <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    <div>
                                        <h4 className="text-sm font-black text-red-900 dark:text-red-400 uppercase tracking-tight">AI Generation Failed</h4>
                                        <p className="text-xs text-red-600 dark:text-red-300 font-medium">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Questions List */}
                            {generatedSections && !isGenerating && (
                                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 flex flex-col max-h-[calc(100vh-140px)]">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 border-b border-blue-100 dark:border-blue-900/50 flex justify-between items-center flex-shrink-0">
                                        <div>
                                            <h3 className="font-black text-blue-900 dark:text-blue-400 uppercase tracking-tight">Assessment Preview</h3>
                                            <p className="text-[10px] text-blue-600 dark:text-blue-500 font-bold uppercase tracking-widest">3 Sections Generated</p>
                                        </div>
                                        <span className="bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg text-xs font-black border border-blue-100 dark:border-slate-700">
                                            {generatedSections.mcqs.length + generatedSections.subjective.length + generatedSections.coding.length} Qs
                                        </span>
                                    </div>

                                    <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto p-0">

                                        {/* MCQs Section */}
                                        {generatedSections.mcqs.length > 0 && (
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <CheckSquare size={16} className="text-blue-600 dark:text-blue-400" />
                                                    <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Multiple Choice ({generatedSections.mcqs.length})</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    {generatedSections.mcqs.map((q, idx) => (
                                                        <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{q.question}</p>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {q.options.map((opt, i) => (
                                                                    <div key={i} className="text-xs px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 truncate font-medium">
                                                                        {opt}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Subjective Section */}
                                        {generatedSections.subjective.length > 0 && (
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <FileText size={16} className="text-amber-600 dark:text-amber-400" />
                                                    <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Subjective ({generatedSections.subjective.length})</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    {generatedSections.subjective.map((q, idx) => (
                                                        <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{q}</p>
                                                            <div className="mt-2 h-16 bg-slate-50 dark:bg-slate-800 rounded border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                                                                Candidate will type answer here...
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Coding Section */}
                                        {generatedSections.coding.length > 0 && (
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Code size={16} className="text-purple-600 dark:text-purple-400" />
                                                    <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Coding Challenge ({generatedSections.coding.length})</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    {generatedSections.coding.map((q, idx) => (
                                                        <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{q.title}</p>
                                                                <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded font-bold">Hard</span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">{q.description}</p>
                                                            <pre className="text-[10px] bg-slate-900 dark:bg-black text-slate-50 p-2 rounded font-mono overflow-x-auto">
                                                                {q.starterCode}
                                                            </pre>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                                        <button
                                            onClick={handlePublish}
                                            disabled={isPublishing}
                                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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
