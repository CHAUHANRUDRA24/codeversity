import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Save, X, AlertOctagon } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const EditJob = () => {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);

    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('Fresher (0-2 years)');

    // Assessment Configuration
    const [duration, setDuration] = useState(60);
    const [difficultyLevel, setDifficultyLevel] = useState('Medium');
    const [mcqWeight, setMcqWeight] = useState(40);
    const [subjectiveWeight, setSubjectiveWeight] = useState(30);
    const [codingWeight, setCodingWeight] = useState(30);

    // Cut-offs & Shortlisting
    const [passingCutOff, setPassingCutOff] = useState(60);
    const [qualifiedCutOff, setQualifiedCutOff] = useState(75);
    const [autoShortlist, setAutoShortlist] = useState(true);
    const [maxApplicants, setMaxApplicants] = useState(50);

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const jobRef = doc(db, "jobs", jobId);
                const jobSnap = await getDoc(jobRef);

                if (jobSnap.exists()) {
                    const data = jobSnap.data();
                    setJobTitle(data.title || '');
                    setJobDescription(data.description || '');
                    setExperienceLevel(data.experienceLevel || 'Fresher (0-2 years)');
                    setDuration(data.duration || 60);
                    setDifficultyLevel(data.difficultyLevel || 'Medium');

                    if (data.questionWeightage) {
                        setMcqWeight(data.questionWeightage.mcq || 40);
                        setSubjectiveWeight(data.questionWeightage.subjective || 30);
                        setCodingWeight(data.questionWeightage.coding || 30);
                    }

                    if (data.cutOffs) {
                        setPassingCutOff(data.cutOffs.passing || 60);
                        setQualifiedCutOff(data.cutOffs.qualified || 75);
                    }

                    setAutoShortlist(data.autoShortlist !== undefined ? data.autoShortlist : true);
                    setMaxApplicants(data.maxApplicants || 50);
                } else {
                    setError("Job not found");
                }
            } catch (err) {
                console.error("Error fetching job:", err);
                setError("Failed to load job details");
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchJob();
        }
    }, [jobId]);

    const handleWeightChange = (type, value) => {
        const newValue = parseInt(value);

        if (type === 'mcq') {
            const remaining = 100 - newValue;
            const subRatio = subjectiveWeight / (subjectiveWeight + codingWeight || 1);
            setMcqWeight(newValue);
            setSubjectiveWeight(Math.round(remaining * subRatio));
            setCodingWeight(remaining - Math.round(remaining * subRatio));
        } else if (type === 'subjective') {
            const remaining = 100 - newValue;
            const mcqRatio = mcqWeight / (mcqWeight + codingWeight || 1);
            setSubjectiveWeight(newValue);
            setMcqWeight(Math.round(remaining * mcqRatio));
            setCodingWeight(remaining - Math.round(remaining * mcqRatio));
        } else if (type === 'coding') {
            const remaining = 100 - newValue;
            const mcqRatio = mcqWeight / (mcqWeight + subjectiveWeight || 1);
            setCodingWeight(newValue);
            setMcqWeight(Math.round(remaining * mcqRatio));
            setSubjectiveWeight(remaining - Math.round(remaining * mcqRatio));
        }
    };

    const handleSave = async () => {
        if (!jobTitle || !jobDescription) {
            alert("Please fill in all required fields");
            return;
        }

        setIsSaving(true);
        try {
            const jobRef = doc(db, "jobs", jobId);
            await updateDoc(jobRef, {
                title: jobTitle,
                description: jobDescription,
                experienceLevel,
                duration,
                difficultyLevel,
                questionWeightage: {
                    mcq: mcqWeight,
                    subjective: subjectiveWeight,
                    coding: codingWeight
                },
                cutOffs: {
                    passing: passingCutOff,
                    qualified: qualifiedCutOff
                },
                autoShortlist,
                maxApplicants,
                minScore: passingCutOff
            });

            navigate('/recruiter-dashboard');
        } catch (error) {
            console.error("Error updating job:", error);
            setError("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#0f1729] text-white">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-bold uppercase tracking-widest">Loading Assessment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#0f1729] text-slate-50 font-sans">
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
                <header className="h-20 bg-[#141d33] border-b border-slate-800 flex items-center justify-between px-8 z-10 shrink-0">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Assessment Editor</p>
                        <h1 className="text-xl font-black text-white uppercase tracking-tight">Edit Assessment</h1>
                    </div>
                    <button
                        onClick={() => navigate('/recruiter-dashboard')}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-400 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all uppercase tracking-widest"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                </header>

                <div className="flex-1 overflow-auto p-8 space-y-8">
                    {error && (
                        <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl flex items-center gap-3">
                            <AlertOctagon className="w-5 h-5 text-red-400" />
                            <div>
                                <h4 className="text-sm font-black text-red-400 uppercase tracking-tight">Error</h4>
                                <p className="text-xs text-red-300 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Job Details Section */}
                    <div className="bg-[#1a2439] p-8 rounded-3xl border border-slate-800">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Job Details</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Job Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-slate-700 bg-[#0f1729] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-white"
                                    placeholder="e.g. Senior Full Stack Engineer"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Experience Level</label>
                                <select
                                    className="w-full px-4 py-3 border border-slate-700 bg-[#0f1729] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-white"
                                    value={experienceLevel}
                                    onChange={(e) => setExperienceLevel(e.target.value)}
                                >
                                    <option>Fresher (0-2 years)</option>
                                    <option>Mid Level (2-5 years)</option>
                                    <option>Senior Level (5+ years)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Job Description</label>
                                <textarea
                                    className="w-full px-4 py-3 border border-slate-700 bg-[#0f1729] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 text-sm font-medium text-white resize-none"
                                    placeholder="Looking for an expert in React, NextJS, and AI integrations. You will lead our generative AI product pod."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                                <p className="text-xs text-slate-500 mt-2 text-right font-medium">{jobDescription.length} chars</p>
                            </div>
                        </div>
                    </div>

                    {/* Assessment Configuration Section */}
                    <div className="bg-[#1a2439] p-8 rounded-3xl border border-slate-800">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Assessment Configuration</h2>

                        <div className="space-y-8">
                            {/* Duration Slider */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Duration: {duration} Minutes</label>
                                    <span className="text-sm font-bold text-blue-400">{duration} mins</span>
                                </div>
                                <input
                                    type="range"
                                    min="15"
                                    max="180"
                                    step="15"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500 font-medium mt-1">
                                    <span>15 min</span>
                                    <span>180 min</span>
                                </div>
                            </div>

                            {/* Difficulty Level */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Difficulty Level</label>
                                <select
                                    className="w-full px-4 py-3 border border-slate-700 bg-[#0f1729] rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium text-white"
                                    value={difficultyLevel}
                                    onChange={(e) => setDifficultyLevel(e.target.value)}
                                >
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                </select>
                            </div>

                            {/* Question Weightage */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Question Weightage (Total: 100%)</label>

                                {/* MCQ */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-slate-300">MCQ</span>
                                        <span className="text-sm font-bold text-blue-400">{mcqWeight}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={mcqWeight}
                                        onChange={(e) => handleWeightChange('mcq', e.target.value)}
                                        className="w-full h-2 bg-blue-900/30 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>

                                {/* Subjective */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-slate-300">Subjective</span>
                                        <span className="text-sm font-bold text-orange-400">{subjectiveWeight}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={subjectiveWeight}
                                        onChange={(e) => handleWeightChange('subjective', e.target.value)}
                                        className="w-full h-2 bg-orange-900/30 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                    />
                                </div>

                                {/* Coding */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-slate-300">Coding</span>
                                        <span className="text-sm font-bold text-purple-400">{codingWeight}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={codingWeight}
                                        onChange={(e) => handleWeightChange('coding', e.target.value)}
                                        className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cut-offs & Shortlisting Section */}
                    <div className="bg-[#1a2439] p-8 rounded-3xl border border-slate-800">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Cut-offs & Shortlisting</h2>

                        <div className="space-y-6">
                            {/* Passing Cut-off */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Passing Cut-off: {passingCutOff}%</label>
                                    <span className="text-sm font-bold text-emerald-400">{passingCutOff}%</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-3">Minimum score for pass status</p>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={passingCutOff}
                                    onChange={(e) => setPassingCutOff(parseInt(e.target.value))}
                                    className="w-full h-2 bg-emerald-900/30 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>

                            {/* Qualified Cut-off */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Qualified Cut-off: {qualifiedCutOff}%</label>
                                    <span className="text-sm font-bold text-blue-400">{qualifiedCutOff}%</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-3">Score for automatic qualification</p>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={qualifiedCutOff}
                                    onChange={(e) => setQualifiedCutOff(parseInt(e.target.value))}
                                    className="w-full h-2 bg-blue-900/30 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            {/* Auto-shortlist Toggle */}
                            <div className="pt-4 border-t border-slate-800">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Auto-shortlist Top Candidates</label>
                                        <p className="text-xs text-slate-500 mt-1">Automatically qualify candidates above threshold</p>
                                    </div>
                                    <button
                                        onClick={() => setAutoShortlist(!autoShortlist)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoShortlist ? 'bg-blue-600' : 'bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoShortlist ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Maximum Applicants */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Maximum Applicants: {maxApplicants}</label>
                                <p className="text-xs text-slate-500 mb-3">Limit the number of candidates</p>
                                <input
                                    type="number"
                                    min="1"
                                    max="1000"
                                    value={maxApplicants}
                                    onChange={(e) => setMaxApplicants(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border border-slate-700 bg-[#0f1729] rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EditJob;
