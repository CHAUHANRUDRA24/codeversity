import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, AlertTriangle, Play } from 'lucide-react';

const TestPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes

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
                console.error("Job not found");
                navigate('/candidate-dashboard'); 
            }
            setLoading(false);
        };
        fetchJob();
    }, [jobId]);

    // Timer Logic
    useEffect(() => {
        if (!loading && job) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit(); // Auto-submit
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [loading, job]);

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSubmit = async () => {
        if (!job || submitting) return;
        setSubmitting(true);

        let score = 0;
        let total = job.questions.length;

        job.questions.forEach(q => {
            const userAnswer = answers[q.id];
            
            if (q.type === 'mcq' || !q.type) {
                // MCQ grading
                if (userAnswer === q.correctAnswer) {
                    score++;
                }
            } else if (q.type === 'subjective' || q.type === 'coding') {
                // "AI" Grading Simulation: Full points for non-empty meaningful answer (>10 chars)
                if (userAnswer && userAnswer.trim().length > 10) {
                    score++; 
                }
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
                answers: answers // Save full answers for review
            });

            navigate(`/result/${jobId}`, { state: { score, total, percentage } });
        } catch (error) {
            console.error("Error submitting test:", error);
            alert("Failed to submit test.");
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
    
    if (!job) return <div className="p-8 text-center">Job not found.</div>;

    const progress = (Object.keys(answers).length / job.questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header / Timer Bar */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 px-4 py-3">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="font-bold text-gray-800 text-lg">{job.title}</h1>
                        <p className="text-xs text-gray-500">Assessment</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono font-medium ${timeLeft < 300 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            <Clock size={16} />
                            {formatTime(timeLeft)}
                         </div>
                         <button 
                            onClick={handleSubmit} 
                            disabled={submitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                         >
                            {submitting ? 'Submitting...' : 'Finish Test'}
                         </button>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="h-1 w-full bg-gray-100 absolute bottom-0 left-0">
                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="space-y-8">
                    {job.questions.map((q, index) => (
                        <div key={q.id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Question Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-start">
                                <div className="flex gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <h3 className="font-medium text-gray-900 text-lg">
                                            {q.type === 'coding' ? q.title : q.question}
                                        </h3>
                                        {q.type === 'coding' && (
                                            <p className="text-sm text-gray-500 mt-1">{q.description}</p>
                                        )}
                                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-600">
                                            {q.type || 'MCQ'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Question Body */}
                            <div className="p-6">
                                {/* MCQ RENDERER */}
                                {(q.type === 'mcq' || !q.type) && (
                                    <div className="space-y-3">
                                        {q.options?.map((option, i) => (
                                            <label 
                                                key={i} 
                                                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${answers[q.id] === option ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-indigo-100 hover:bg-gray-50'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${q.id}`}
                                                    value={option}
                                                    checked={answers[q.id] === option}
                                                    onChange={() => handleAnswerChange(q.id, option)}
                                                    className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                />
                                                <span className="ml-3 text-gray-700 font-medium">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {/* SUBJECTIVE RENDERER */}
                                {q.type === 'subjective' && (
                                    <div className="space-y-2">
                                        <textarea 
                                            className="w-full h-32 p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans text-sm resize-none"
                                            placeholder="Type your detailed answer here..."
                                            value={answers[q.id] || ''}
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        ></textarea>
                                        <p className="text-xs text-gray-400 text-right">
                                            {(answers[q.id] || '').length} chars
                                        </p>
                                    </div>
                                )}

                                {/* CODING RENDERER */}
                                {q.type === 'coding' && (
                                    <div className="space-y-2">
                                        <div className="bg-slate-900 rounded-lg overflow-hidden">
                                            <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
                                                <div className="flex gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                </div>
                                                <span className="text-xs text-slate-400 ml-2 font-mono">solution.js</span>
                                            </div>
                                            <textarea 
                                                className="w-full h-48 p-4 bg-slate-900 text-slate-50 font-mono text-sm focus:outline-none resize-none"
                                                placeholder={q.starterCode || "// Write your code here"}
                                                value={answers[q.id] || q.starterCode || ''}
                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                spellCheck="false"
                                            ></textarea>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 transition-all hover:-translate-y-1"
                    >
                        Submit Final Assessment
                    </button>
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
