import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { gradeAssessment } from '../services/gradingService';
import { gradeEntireAssessment } from '../services/aiService';
import { CheckCircle, Clock, AlertTriangle, Play, Sparkles, Shield, HelpCircle, ChevronRight, Loader } from 'lucide-react';

const TestPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [tabSwitchViolation, setTabSwitchViolation] = useState(false);
    const [pasteViolationCount, setPasteViolationCount] = useState(0);

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

    // Tab Switch Detection - Anti-Cheating Measure
    useEffect(() => {
        if (!loading && job && !submitting) {
            const handleVisibilityChange = () => {
                if (document.hidden) {
                    // User switched tabs - Show detailed alert and auto submit
                    alert(
                        '🚨 ANTI-CHEATING VIOLATION DETECTED! 🚨\n\n' +
                        '⚠️ You have switched tabs or windows during the assessment.\n\n' +
                        'ACTION TAKEN:\n' +
                        '• Your test is being automatically submitted\n' +
                        '• Your current answers have been recorded\n' +
                        '• This incident will be flagged in your report\n\n' +
                        'REASON: Tab switching is prohibited to maintain assessment integrity.\n\n' +
                        'Click OK to proceed to your results.'
                    );
                    setTabSwitchViolation(true);
                    handleSubmit(true); // Pass violation flag
                }
            };

            // Add event listener for visibility change
            document.addEventListener('visibilitychange', handleVisibilityChange);

            // Cleanup
            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
    }, [loading, job, submitting]);

    const handleAnswerChange = (questionIndex, value) => {
        const qId = job.questions[questionIndex].id || questionIndex;
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: value // Store by Index to simplify navigation
        }));
    };

    const handlePaste = (e) => {
        e.preventDefault();
        setPasteViolationCount(prev => prev + 1);
        alert("⚠️ Copy/Paste is disabled for this assessment.\nRepeated attempts will be flagged to the recruiter.");
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSubmit = async (isViolation = false) => {
        // Guard: If called from onClick, isViolation might be an Event object, which we treat as false.
        const actualViolation = typeof isViolation === 'boolean' ? isViolation : false;

        console.log("Starting submission process... (v3)", { actualViolation }); 
        if (!job || submitting) return;
        setSubmitting(true);

        try {
            // Calculate grading results
             /* const gradingResults = await gradeAssessment(job, answers); */
            
            // USE AI GRADING with Anti-Cheating Metadata
            const initialTime = (job.estimatedTime || 30) * 60;
            const timeTakenSeconds = initialTime - timeLeft;
            
            const aiResults = await gradeEntireAssessment(job, answers, {
                ...(user?.aiAnalysis || {}),
                tabSwitch: actualViolation || tabSwitchViolation,
                pasteViolations: pasteViolationCount,
                timeTakenSeconds,
                totalQuestions: job.questions.length
            });

            // Sanitize grading results to remove any undefined values which Firestore doesn't support
            const safeGradingResults = JSON.parse(JSON.stringify(aiResults));

            const score = aiResults.totalScore;
            // const total = gradingResults.totalQuestions; 
            const total = aiResults.maxScore; // Use maxScore from AI (e.g. 80 for 8 questions)
            const percentage = aiResults.percentage;

            await addDoc(collection(db, "results"), {
                userId: user.uid,
                jobId: jobId,
                jobTitle: job.title,
                score: score,
                total: total,
                percentage: percentage,
                submittedAt: new Date().toISOString(),
                answers: answers, // Save full answers for review
                tabSwitchViolation: actualViolation || tabSwitchViolation, // Flag if cheating detected
                pasteViolations: pasteViolationCount,
                // Save detailed AI analysis
                aiEvaluation: safeGradingResults
            });

            navigate(`/result/${jobId}`, {
                state: {
                    score,
                    total,
                    percentage,
                    tabSwitchViolation: actualViolation || tabSwitchViolation,
                    pasteViolations: pasteViolationCount,
                    aiEvaluation: aiResults
                }
            });
        } catch (error) {
            console.error("Error submitting test:", error);
            alert("Failed to submit test. Please try again.");
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
    const currentQ = job.questions[activeQuestion];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header / Timer Bar */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 px-4 py-3">
                <div className="max-w-7xl mx-auto flex justify-between items-center relative z-20">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-xl">I</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-800 text-lg hidden md:block">{job.title}</h1>
                            <p className="text-xs text-gray-500 uppercase tracking-widest hidden md:block">Assessment</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-sm shadow-sm border ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-white text-slate-600 border-slate-200'}`}>
                            <Clock size={16} />
                            {formatTime(timeLeft)}
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-slate-900 hover:bg-black text-white px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader className="animate-spin w-4 h-4" /> Analyzing with AI...
                                </span>
                            ) : 'Finish Test'}
                        </button>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full">
                    <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
            </header>

            {/* Anti-Cheating Warning Banner */}
            <div className="bg-amber-50 border-y border-amber-200">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-xs font-bold text-amber-800">
                        <span className="font-black uppercase tracking-wider">⚠ Anti-Cheating System Active:</span> Switching tabs or windows during this assessment will result in automatic submission. Please stay on this page until you finish.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Navigation Panel */}
                <aside className="lg:col-span-3 space-y-6 hidden lg:block">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Navigation Matrix</h3>
                        <div className="grid grid-cols-4 gap-3">
                            {job.questions.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveQuestion(i)}
                                    className={`h-12 w-full rounded-xl flex items-center justify-center font-black text-xs transition-all border ${activeQuestion === i
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/20'
                                        : answers[i]
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-indigo-200'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                <span>Completion</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                        <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/5" />
                        <h4 className="text-sm font-black uppercase tracking-tight mb-2 relative z-10">AI Proctoring</h4>
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest relative z-10">
                            <Shield className="w-4 h-4" /> Active
                        </div>
                    </div>
                </aside>

                {/* Center: Question Area */}
                <div className="lg:col-span-9">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[500px] flex flex-col">
                        <div className="bg-slate-50 px-10 py-6 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <span className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg">
                                    {activeQuestion + 1}
                                </span>
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Question Segment</h3>
                                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{currentQ.type || 'Standard'} Assessment</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentQ.type || 'MCQ'}</span>
                            </div>
                        </div>

                        <div className="p-10 flex-1">
                            <h2 className="text-xl font-bold text-slate-900 leading-tight mb-8">
                                {currentQ.type === 'coding' ? currentQ.title : currentQ.question}
                            </h2>

                            {currentQ.type === 'coding' && (
                                <p className="text-sm text-slate-600 mb-6">{currentQ.description}</p>
                            )}

                            <div className="w-full">
                                {/* MCQ RENDERER */}
                                {(currentQ.type === 'mcq' || !currentQ.type) && (
                                    <div className="grid grid-cols-1 gap-3">
                                        {currentQ.options?.map((option, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswerChange(activeQuestion, option)}
                                                className={`group relative p-4 rounded-xl border-2 text-left transition-all active:scale-[0.99] ${answers[activeQuestion] === option
                                                    ? 'bg-indigo-50 border-indigo-600 text-indigo-900'
                                                    : 'bg-white border-slate-100 hover:border-indigo-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${answers[activeQuestion] === option
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-indigo-600'
                                                        }`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <span className="text-sm font-medium">{option}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* SUBJECTIVE RENDERER */}
                                {currentQ.type === 'subjective' && (
                                    <div className="relative">
                                        <textarea
                                            className="w-full h-64 p-6 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all resize-none text-slate-700 leading-relaxed"
                                            placeholder="Type your detailed answer here..."
                                            value={answers[activeQuestion] || ''}
                                            onChange={(e) => handleAnswerChange(activeQuestion, e.target.value)}
                                            onPaste={handlePaste}
                                            onCopy={(e) => e.preventDefault()}
                                            onCut={(e) => e.preventDefault()}
                                        ></textarea>
                                        <div className="absolute bottom-4 right-4 text-xs font-bold text-slate-400 pointer-events-none">
                                            {(answers[activeQuestion] || '').length} chars
                                        </div>
                                    </div>
                                )}

                                {/* CODING RENDERER */}
                                {currentQ.type === 'coding' && (
                                    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl">
                                        <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                </div>
                                                <span className="text-xs font-mono text-slate-500 ml-2">editor</span>
                                            </div>
                                            <span className="text-[10px] font-mono text-emerald-500">JavaScript</span>
                                        </div>
                                        <textarea
                                            className="w-full h-96 p-4 bg-slate-900 text-slate-300 font-mono text-sm focus:outline-none resize-none leading-relaxed"
                                            placeholder={currentQ.starterCode || "// Write your code here"}
                                            value={answers[activeQuestion] || currentQ.starterCode || ''}
                                            onChange={(e) => handleAnswerChange(activeQuestion, e.target.value)}
                                            spellCheck="false"
                                            onPaste={handlePaste}
                                            onCopy={(e) => e.preventDefault()}
                                            onCut={(e) => e.preventDefault()}
                                        ></textarea>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <button
                                onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
                                disabled={activeQuestion === 0}
                                className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-0"
                            >
                                Previous
                            </button>

                            {activeQuestion < job.questions.length - 1 ? (
                                <button
                                    onClick={() => setActiveQuestion(prev => prev + 1)}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 group"
                                >
                                    Next <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
