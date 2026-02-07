import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
    Briefcase, Timer, CheckCircle, ArrowRight,
    BrainCircuit, Sparkles, Shield, ChevronRight,
    Loader, HelpCircle, FileText
} from 'lucide-react';

const TestPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins default
    const [activeQuestion, setActiveQuestion] = useState(0);

    useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) return;
            const jobRef = doc(db, "jobs", jobId);
            const jobSnap = await getDoc(jobRef);
            if (jobSnap.exists()) {
                const data = jobSnap.data();
                setJob({ id: jobSnap.id, ...data });
                // If job has estimatedTime, use it
                if (data.estimatedTime) setTimeLeft(data.estimatedTime * 60);
            } else {
                navigate('/candidate-dashboard');
            }
            setLoading(false);
        };
        fetchJob();
    }, [jobId]);

    // Timer logic
    useEffect(() => {
        if (loading || submitting || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, submitting, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId, selectedOption) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    const handleSubmit = async () => {
        if (!job) return;
        setSubmitting(true);

        let score = 0;
        const total = job.questions.length;

        // Scoring
        job.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                score++;
            }
        });

        const percentage = (score / total) * 100;

        try {
            await addDoc(collection(db, "results"), {
                userId: user.uid,
                jobId: jobId,
                jobTitle: job.title,
                score: score,
                total: total,
                percentage: percentage,
                submittedAt: new Date().toISOString(),
                createdAt: serverTimestamp(),
                // Simulated AI evaluation data per the user's concept
                aiEvaluation: {
                    credibilityScore: Math.min(100, Math.max(0, percentage + (Math.random() * 20 - 10))),
                    skillSync: [
                        { skill: 'Core Knowledge', claimed: 'Expert', verified: percentage >= 80 ? 'Expert' : percentage >= 60 ? 'Intermediate' : 'Entry', score: percentage },
                        { skill: 'Execution Strategy', claimed: 'Senior', verified: percentage >= 70 ? 'Optimal' : 'Standard', score: Math.min(100, percentage + 5) }
                    ],
                    recommendation: percentage >= 60 ? "Proceed with High Priority" : "Re-evaluate Skill Alignment"
                }
            });

            // Navigate to evaluation/result page
            navigate(`/result/${jobId}`, { state: { score, total, percentage, aiEvaluation: true } });
        } catch (error) {
            console.error("Error submitting test:", error);
            alert("Failed to submit test.");
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
            <div className="flex flex-col items-center">
                <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Assessment Data...</p>
            </div>
        </div>
    );

    if (!job) return <div>Job not found.</div>;

    const currentQ = job.questions[activeQuestion];
    const progress = (Object.keys(answers).length / job.questions.length) * 100;

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 dark:bg-[#0f172a] transition-colors duration-500">
            {/* Header / HUD */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                            <BrainCircuit className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black dark:text-white uppercase tracking-tight">{job.title}</h2>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Technical Assessment Module</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Time Remaining</p>
                            <div className={`flex items-center gap-2 font-black text-xl tracking-tighter ${timeLeft < 120 ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                                <Timer className="w-5 h-5" />
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-200 dark:shadow-none transform active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? 'Terminating...' : 'Finalize & Submit'}
                        </button>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-slate-100 dark:bg-slate-800 w-full">
                    <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Navigation Panel */}
                <aside className="lg:col-span-3 space-y-6">
                    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 px-2">Navigation Matrix</h3>
                        <div className="grid grid-cols-4 gap-3">
                            {job.questions.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveQuestion(i)}
                                    className={`h-12 w-full rounded-xl flex items-center justify-center font-black text-xs transition-all border ${activeQuestion === i
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10'
                                            : answers[i]
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/50'
                                                : 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                                <span>Completion</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                        <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/5 group-hover:scale-125 transition-transform duration-700" />
                        <h4 className="text-sm font-black uppercase tracking-tight mb-2 relative z-10">AI Integrity Check</h4>
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight relative z-10">System is monitoring patterns to ensure assessment validity.</p>
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest relative z-10">
                            <Shield className="w-4 h-4" /> Secure Session
                        </div>
                    </div>
                </aside>

                {/* Center: Question Area */}
                <div className="lg:col-span-9">
                    <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden min-h-[500px] flex flex-col">
                        <div className="bg-slate-50 dark:bg-slate-900/50 px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <span className="h-10 w-10 bg-slate-900 dark:bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg">
                                    {activeQuestion + 1}
                                </span>
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Question Segment</h3>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Technical Proficiency Test</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multiple Choice</span>
                            </div>
                        </div>

                        <div className="p-10 flex-1">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-12 uppercase tracking-tight">
                                {currentQ.question}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQ.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswerChange(activeQuestion, option)} // using index
                                        className={`group relative p-6 rounded-3xl border-2 text-left transition-all duration-300 active:scale-[0.98] ${answers[activeQuestion] === option
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/30'
                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${answers[activeQuestion] === option
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                                                }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={`text-sm font-black uppercase tracking-tight ${answers[activeQuestion] === option ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                                                }`}>
                                                {option}
                                            </span>
                                        </div>
                                        {answers[activeQuestion] === option && (
                                            <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                                                <CheckCircle className="w-5 h-5 text-white/50" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-10 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <button
                                onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
                                disabled={activeQuestion === 0}
                                className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-0"
                            >
                                Previous
                            </button>

                            {activeQuestion < job.questions.length - 1 ? (
                                <button
                                    onClick={() => setActiveQuestion(prev => prev + 1)}
                                    className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black dark:hover:bg-blue-700 transition-all flex items-center gap-2 group"
                                >
                                    Proceed <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="bg-emerald-600 text-white px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                                >
                                    {submitting ? 'Processing...' : 'Complete Assessment'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TestPage;
