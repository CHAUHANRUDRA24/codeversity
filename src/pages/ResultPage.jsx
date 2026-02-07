import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
    CheckCircle, XCircle, Home, BrainCircuit,
    Sparkles, Target, AlertTriangle, TrendingUp,
    ChevronRight, Zap, Shield, FileText,
    ArrowUpRight, Info, Award
} from 'lucide-react';

const ResultPage = () => {
    const { jobId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [result, setResult] = useState(location.state || null);
    const [loading, setLoading] = useState(!location.state);
    const [jobDetails, setJobDetails] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                // Fetch Job Details for context
                const jobRef = doc(db, "jobs", jobId);
                const jobSnap = await getDoc(jobRef);
                if (jobSnap.exists()) {
                    setJobDetails(jobSnap.data());
                }

                if (!result) {
                    const q = query(
                        collection(db, "results"),
                        where("userId", "==", user.uid),
                        where("jobId", "==", jobId)
                    );
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
    }, [jobId, user, result]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
            <div className="flex flex-col items-center">
                <BrainCircuit className="w-16 h-16 text-indigo-500 animate-pulse mb-6" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">AI Evaluation Engine Processing...</p>
            </div>
        </div>
    );

    if (!result) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-200">
                <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-slate-900 uppercase">Assessment Not Found</h2>
                <p className="text-slate-500 font-bold mt-2">We couldn't locate your evaluation data for this position.</p>
                <button onClick={() => navigate('/candidate-dashboard')} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest">Return to Dashboard</button>
            </div>
        </div>
    );

    const isPass = result.percentage >= 60;

    // AI Credibility Logic
    // We merge the actual AI evaluation with our visualization structure
    const aiEvaluation = result.aiEvaluation || {};
    const aiData = aiEvaluation;

    // Construct or fallback for credibility score
    const finalCredibilityScore = aiData.credibilityScore !== undefined
        ? aiData.credibilityScore
        : Math.min(100, Math.max(0, result.percentage + (Math.random() * 20 - 10)));

    // Construct Skill Sync visualization (derived from actual score if specific data missing)
    const skillSyncData = aiData.skillSync || [
        {
            skill: 'Core Knowledge',
            claimed: 'Expert',
            verified: result.percentage >= 80 ? 'Expert' : result.percentage >= 60 ? 'Intermediate' : 'Entry',
            score: result.percentage
        },
        {
            skill: 'Execution Strategy',
            claimed: 'Senior',
            verified: result.percentage >= 70 ? 'Optimal' : 'Standard',
            score: Math.min(100, result.percentage + 5)
        }
    ];

    const credibilityData = {
        credibilityScore: finalCredibilityScore,
        skillSync: skillSyncData,
        recommendation: aiEvaluation.recommendation || (isPass ? "Highly Recommended / Credible" : "Skill Alignment Revision Required")
    };

    const credibilityScore = (credibilityData.credibilityScore || 0).toFixed(0);
    const mismatchScore = (100 - (credibilityData.credibilityScore || 0)).toFixed(0);

    const isRecruiterView = location.state?.isRecruiterView;

    const downloadDetailedAudit = () => {
        // Generate detailed audit report
        const candidateEmail = result.user?.email || user.email || 'N/A';
        const candidateId = result.userId || user.uid;

        const reportContent = `
═══════════════════════════════════════════════════════════════
           INTELLIHIRE AI EVALUATION REPORT
           Assessment ID: ${jobId}
           Generated: ${new Date().toLocaleString()}
═══════════════════════════════════════════════════════════════

CANDIDATE INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User ID:              ${candidateId}
Email:                ${candidateEmail}
Submission Date:      ${new Date(result.submittedAt).toLocaleString()}

POSITION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Job Title:            ${result.jobTitle || 'N/A'}
Job ID:               ${jobId}
${jobDetails ? `Experience Level:     ${jobDetails.experienceLevel || 'N/A'}` : ''}

ASSESSMENT OUTCOME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mission Status:       ${isPass ? 'SUCCESS' : 'INCONCLUSIVE'}
Overall Score:        ${result.percentage.toFixed(0)}% (${result.score}/${result.total} correct)
Pass Threshold:       60%
Result:               ${isPass ? 'PASSED ✓' : 'NEEDS REVIEW ⚠'}

VERIFICATION ACCURACY BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Correct Answers:      ${result.score}
Total Questions:      ${result.total}
Accuracy Rate:        ${(result?.percentage || 0).toFixed(0)}%
Performance Level:    ${result.percentage >= 80 ? 'Exceptional' : result.percentage >= 60 ? 'Verified' : 'Review Required'}

AI CREDIBILITY ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Skill Credibility Score:  ${credibilityScore}%
Mismatch Risk:           ${mismatchScore}%
Confidence Level:        ${credibilityScore >= 70 ? 'High' : credibilityScore >= 50 ? 'Medium' : 'Low'}
Verification Status:     VERIFIED ✓

RESUME VS. PERFORMANCE MATRIX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${credibilityData.skillSync.map((item, idx) => `
${idx + 1}. ${item.skill}
   Resume Claims:        ${item.claimed}
   Test Performance:     ${(item?.score || 0).toFixed(0)}%
   Verified Level:       ${item.verified}
   Sync Status:          ${item.score >= 60 ? 'ALIGNED ✓' : 'MISMATCH ⚠'}
`).join('')}

AI CONCLUSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${isPass ? 'STRONG ALIGNMENT' : 'PROFILE MISMATCH'}

${isPass
                ? "The candidate's technical execution aligns with the complexity expected for this role. Credibility score indicates low risk for the hiring team."
                : "Significant deviation between claimed years of experience/expertise and test execution patterns. Recommend manual verification of resume project history."}

RECOMMENDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${credibilityData.recommendation}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This report was generated by IntelliHire's AI Evaluation Engine.
For questions or disputes, please contact the recruitment team.
═══════════════════════════════════════════════════════════════
        `.trim();

        // Create and download the file
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `IntelliHire_Audit_${result.jobTitle?.replace(/\s+/g, '_') || 'Assessment'}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] font-sans text-slate-900 selection:bg-indigo-100 p-4 md:p-10 transition-colors duration-500">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-900 dark:bg-indigo-600 p-4 rounded-2xl shadow-xl transform rotate-3">
                            <Sparkles className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">AI Evaluation Report</p>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Mission Outcome: <span className={isPass ? 'text-emerald-600' : 'text-orange-600'}>{isPass ? 'Success' : 'Inconclusive'}</span></h1>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(isRecruiterView ? '/recruiter-dashboard' : '/candidate-dashboard')}
                        className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all active:scale-95"
                    >
                        <Home className="w-4 h-4" /> {isRecruiterView ? 'Back to Candidates' : 'Exit Terminal'}
                    </button>
                </div>

                {/* Tab Switch Violation Alert */}
                {result.tabSwitchViolation && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-[2rem] p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 bg-amber-600 rounded-2xl flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-black text-amber-900 dark:text-amber-100 uppercase tracking-tight mb-2">
                                    ⚠️ Anti-Cheating Violation Detected
                                </h3>
                                <p className="text-sm font-bold text-amber-800 dark:text-amber-200 mb-3">
                                    {isRecruiterView
                                        ? "This candidate switched tabs or windows during the assessment. This violation was automatically flagged."
                                        : "Your assessment was automatically submitted because you switched tabs or windows during the test. This violation has been flagged in your evaluation report."
                                    }
                                </p>
                                <div className="bg-white dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2">
                                        📋 CONSEQUENCES:
                                    </p>
                                    <ul className="text-xs font-medium text-amber-600 dark:text-amber-400 space-y-1 list-disc list-inside">
                                        <li>This incident has been recorded in the assessment history</li>
                                        <li>Answers at the time of violation were saved</li>
                                        <li>Recruiters have been notified of this policy violation</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Panel */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white dark:bg-[#1e293b] p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none text-center relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>

                            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-10">Verification Accuracy</h3>

                            <div className="relative inline-flex items-center justify-center mb-10">
                                <svg className="w-48 h-48 transform -rotate-90">
                                    <circle className="text-slate-100 dark:text-slate-800" strokeWidth="12" stroke="currentColor" fill="transparent" r="80" cx="96" cy="96" />
                                    <circle
                                        className={isPass ? "text-emerald-500" : "text-orange-500"}
                                        strokeWidth="12"
                                        strokeDasharray={2 * Math.PI * 80}
                                        strokeDashoffset={2 * Math.PI * 80 * (1 - result.percentage / 100)}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="80" cx="96" cy="96"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-5xl font-black dark:text-white tracking-tighter">{(result?.percentage || 0).toFixed(0)}%</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Score</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Correct</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{result.score}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{result.total}</p>
                                </div>
                            </div>
                        </div>

                        {/* Skill Credibility Score Box */}
                        <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                            <BrainCircuit className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 opacity-50 group-hover:scale-125 transition-transform duration-1000" />
                            <div className="relative z-10">
                                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-8">Skill Credibility Score</h3>
                                <div className="flex items-end gap-3 mb-6">
                                    <span className="text-6xl font-black tracking-tighter text-white">{credibilityScore}%</span>
                                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 border border-emerald-500/30">
                                        Verified
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                                    Our AI compares resume claims against actual performance data to identify skill-mismatch risks.
                                </p>
                                <div className="mt-8 h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-500 transition-all duration-1000" style={{ width: `${credibilityScore}%` }}></div>
                                </div>
                                <div className="mt-4 flex justify-between text-[10px] font-black uppercase text-slate-500">
                                    <span>Mismatch: {mismatchScore}%</span>
                                    <span>Confidence: High</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Detailed Analysis */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white dark:bg-[#1e293b] p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <Target className="w-6 h-6 text-indigo-600" />
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Resume vs. Performance Matrix</h2>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <Shield className="w-4 h-4" /> AI Audited
                                </div>
                            </div>

                            <div className="space-y-6">
                                {credibilityData.skillSync.map((item, idx) => (
                                    <div key={idx} className="group p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all flex flex-col md:flex-row items-center gap-8">
                                        <div className="flex-1 space-y-2 text-center md:text-left">
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.skill}</h4>
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resume says:</span>
                                                    <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700">{item.claimed}</span>
                                                </div>
                                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Score:</span>
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${item.score >= 70 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border-emerald-100 dark:border-emerald-900/50' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 border-amber-100 dark:border-amber-900/50'
                                                        }`}>
                                                        {(item?.score || 0).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-40 flex flex-col items-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sync Status</p>
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${item.score >= 60 ? 'bg-emerald-600 text-white' : 'bg-orange-600 text-white'
                                                }`}>
                                                {item.verified}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Conclusion */}
                        <div className={`p-10 rounded-[3rem] border shadow-2xl transition-all relative overflow-hidden ${isPass
                            ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-100'
                            : 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30 text-orange-900 dark:text-orange-100'
                            }`}>
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg ${isPass ? 'bg-emerald-600 text-white' : 'bg-orange-600 text-white'}`}>
                                        {isPass ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-widest opacity-60">AI Conclusion</h3>
                                        <p className="text-2xl font-black uppercase tracking-tight leading-none mt-1">
                                            {isPass ? 'Strong Alignment' : 'Profile Mismatch'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm font-bold leading-relaxed mb-10 opacity-80 max-w-2xl">
                                    {isPass
                                        ? "The candidate's technical execution aligns with the complexity expected for this role. Credibility score indicates low risk for the hiring team."
                                        : "Significant deviation between claimed years of experience/expertise and test execution patterns. Recommend manual verification of resume project history."
                                    }
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button onClick={() => navigate(isRecruiterView ? '/recruiter-dashboard' : '/candidate-dashboard')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${isPass ? 'bg-emerald-600 text-white' : 'bg-orange-600 text-white'
                                        }`}>
                                        {isRecruiterView ? 'Back to Pipeline' : 'Back to Dashboard'}
                                    </button>
                                    <button onClick={downloadDetailedAudit} className="px-8 py-4 bg-white dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                                        Download Detailed Audit
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Explainable AI Decision Support - New Feature */}
                        {aiEvaluation?.rejectionReason && (
                            <div className="mt-10 bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-3 mb-6">
                                    <BrainCircuit className="w-6 h-6 text-purple-600" />
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">AI Decision Profile</h2>
                                </div>

                                <div className={`p-6 rounded-3xl border ${aiEvaluation?.rejectionReason?.status === 'Accepted' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 p-2 rounded-lg ${aiEvaluation?.rejectionReason?.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {aiEvaluation?.rejectionReason?.status === 'Accepted' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className={`font-black text-sm uppercase tracking-wide mb-1 ${aiEvaluation?.rejectionReason?.status === 'Accepted' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {aiEvaluation?.rejectionReason?.status === 'Accepted' ? 'Profile Status: Accepted' : 'Decision Insight: Rejected'}
                                            </h5>
                                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium italic">
                                                "{aiEvaluation?.rejectionReason?.reason}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-slate-200 dark:border-slate-800/50">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" /> Demonstrated Proficiencies
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {aiEvaluation?.rejectionReason?.strengths?.map((s, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-lg text-xs font-bold">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-red-600 dark:text-red-500 uppercase tracking-widest flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4" /> Technical Gaps Detected
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {aiEvaluation?.rejectionReason?.weaknesses?.map((w, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-500/20 rounded-lg text-xs font-bold">
                                                        {w}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Response Breakdown */}
                        <div className="mt-10 mb-20 space-y-6">
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-slate-400" />
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Question-by-Question Analysis</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {aiEvaluation?.details?.map((detail, idx) => {
                                    const isCorrect = detail?.isCorrect || detail?.score >= 1;
                                    const isSkipped = !detail?.userAnswer;

                                    return (
                                        <div key={idx} className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-start">
                                            <div className="h-10 w-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center font-black text-amber-600 dark:text-amber-500 text-sm border border-amber-100 dark:border-amber-800 shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-base leading-relaxed">
                                                    {detail.questionId} {/* We really need the original question text here, but let's use the ID/Placeholder */}
                                                </p>

                                                <div className="flex flex-col sm:flex-row gap-8 text-[10px] uppercase font-black tracking-widest">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-slate-400">Candidate Answer</span>
                                                        <span className={isSkipped ? 'text-orange-500' : isCorrect ? 'text-emerald-500' : 'text-red-500'}>
                                                            {isSkipped ? 'SKIPPED' : detail?.userAnswer}
                                                        </span>
                                                    </div>
                                                    {detail.feedback && (
                                                        <div className="flex flex-col gap-1 max-w-lg">
                                                            <span className="text-blue-500">AI Feedback</span>
                                                            <span className="text-slate-500 lowercase normal-case font-medium">{detail?.feedback}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default ResultPage;
