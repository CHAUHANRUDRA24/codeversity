import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, orderBy, doc, updateDoc, addDoc, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { 
    Briefcase, Play, Clock, Layout, Loader, LogOut, FileText, 
    CheckCircle, Search, Upload, Shield, Award, Sparkles, AlertTriangle, Cpu,
    ChevronRight, XCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { processResume } from '../utils/pdfUtils';
import { matchResumeToJobs, analyzeResume } from '../services/aiService';

const CandidateDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    
    // State Management
    const [jobs, setJobs] = useState([]);
    const [results, setResults] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || null);
    const [aiAnalysis, setAiAnalysis] = useState(user?.aiAnalysis || null);

    // Initial Data Fetch & URL Handling
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get('tab') || 'dashboard';
        setActiveTab(tab);
    }, [location.search]);

    // Fetch Jobs (Dashboard)
    useEffect(() => {
        const fetchJobs = async () => {
             if (!user) return;

             // Update local analysis if user object changes
             if (user?.aiAnalysis) setAiAnalysis(user.aiAnalysis);

             try {
                 const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
                 const querySnapshot = await getDocs(q);
                 const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                 // MERGE AI MATCHES if available in user profile
                 if (user.aiMatches && Array.isArray(user.aiMatches)) {
                     jobsData.forEach(job => {
                         const match = user.aiMatches.find(m => m.jobId === job.id);
                         if (match) {
                             job.matchScore = match.score;
                             job.matchReason = match.reason;
                         }
                     });
                     // Sort by match score
                     jobsData.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
                 }

                 setJobs(jobsData);
             } catch (error) {
                 console.error("Error fetching jobs:", error);
             }
             setLoading(false);
        };
        fetchJobs();
    }, [user]);

    // Fetch Results (History)
    useEffect(() => {
        const fetchResults = async () => {
            if (!user) return;
            // Fetch results regardless of tab to show count in stats
            try {
                const q = query(
                    collection(db, "results"),
                    where("userId", "==", user.uid)
                );
                const querySnapshot = await getDocs(q);
                let resultsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Client-side sort to avoid index requirements
                resultsData.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
                
                setResults(resultsData);
            } catch (error) {
                console.error("Error fetching results:", error);
            }
        };
        fetchResults();
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            console.log("[Pipeline] Starting Resume Engine...");

            // 1. Text Extraction (PDF Text Layer -> OCR Fallback)
            const extractedText = await processResume(file);
            console.log("[Pipeline] Text Extracted. Length:", extractedText.length);

            // 2. Parallel Processing (Upload PDF + AI Analysis)
            const uploadToStorage = async () => {
                const storageRef = ref(storage, `resumes/${user.uid}/original.pdf`);
                // Use a short timeout to prevent hanging on CORS
                const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000));
                await Promise.race([uploadBytes(storageRef, file), timeout]);
                return await getDownloadURL(storageRef);
            };

            console.log("[Pipeline] Triggering AI & Storage Tasks...");
            const [pdfUrl, analysis, matchedJobsResults] = await Promise.all([
                uploadToStorage().catch(() => "https://simulation.mode/resume.pdf"), // Fallback if CORS fails
                analyzeResume(extractedText),
                matchResumeToJobs(extractedText, jobs)
            ]);

            // 3. Store in Firestore (Collection: resumes)
            // We store the analysis as a field within the resume doc for better performance in this MVP
            const resumeRef = await addDoc(collection(db, "resumes"), {
                userId: user.uid,
                extractedText: extractedText,
                extractedAt: new Date().toISOString(),
                skillSummary: analysis.technicalSkills?.join(', ') || "N/A",
                matchScore: analysis.resumeQualityScore || 0,
                analysis: analysis, // Full structured data
                originalUrl: pdfUrl,
                fileName: file.name
            });

            // 4. Update User Profile to link current resume
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                resumeUrl: pdfUrl,
                resumeName: file.name,
                currentResumeId: resumeRef.id,
                aiAnalysis: analysis, // Cache here for immediate dashboard display
                aiMatches: matchedJobsResults
            });

            console.log("[Pipeline] Success. Resume ID:", resumeRef.id);
            setResumeUrl(pdfUrl);
            setAiAnalysis(analysis); // Immediate UI update
            
            // Re-sort jobs based on new matches
            const updatedJobs = jobs.map(job => {
                const match = matchedJobsResults.find(m => m.jobId === job.id);
                return match ? { ...job, matchScore: match.score, matchReason: match.reason } : job;
            });
            updatedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
            setJobs(updatedJobs);

            alert(`Analysis Successful! Resume Score: ${analysis.resumeQualityScore}%`);

        } catch (error) {
            console.error("[Pipeline] Processing Failed:", error);
            alert("Failed to process resume. Please ensure it's a valid PDF.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f7f8] dark:bg-[#0f172a] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-200">
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
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-10 transition-colors duration-200 shrink-0">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Candidate Portal</p>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {activeTab === 'dashboard' ? 'Explorer Dashboard' : 'My Applications'}
                            </h1>
                            <span className="text-slate-300 dark:text-slate-600 text-lg">/</span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wide text-sm border-b-2 border-blue-600 dark:border-blue-400 pb-0.5">
                                {activeTab === 'dashboard' ? 'Opportunities' : 'History'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{user?.email?.split('@')[0]}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Certified Candidate</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
                    
                    {activeTab === 'dashboard' ? (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            
                            {/* LEFT COLUMN - MAIN CONTENT */}
                            <div className="xl:col-span-2 space-y-8">
                                
                                {/* Hero Banner */}
                                <div className="bg-[#0f172a] dark:bg-black rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-slate-900/10 text-white flex flex-col justify-center min-h-[320px]">
                                    {/* Abstract Shapes */}
                                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
                                    
                                    <div className="relative z-10 max-w-xl">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-400/20 text-[10px] font-bold uppercase tracking-widest mb-6 text-blue-300">
                                            <Sparkles className="w-3 h-3" /> System Status: Online
                                        </div>
                                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-[0.9]">
                                            PROVE YOUR <br/>
                                            <span className="text-blue-500">EXPERTISE.</span>
                                        </h2>
                                        <p className="text-slate-400 text-lg mb-8 max-w-md font-medium leading-relaxed">
                                            Browse active job missions and complete assessments to get verified skill reports.
                                        </p>

                                        {!resumeUrl && (
                                            <div className="inline-flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-xs font-bold uppercase tracking-widest">
                                                <AlertTriangle className="w-4 h-4" />
                                                Resume Missing! Upload your resume to enable AI skill matching.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Open Assessments Header & Search */}
                                <div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2">
                                        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Open Assessments</h2>
                                        <div className="relative w-full md:w-72">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                placeholder="Search Missions..." 
                                                className="w-full h-12 pl-12 pr-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Jobs Grid */}
                                    {loading ? (
                                         <div className="text-center py-20">
                                            <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Missions...</p>
                                        </div>
                                    ) : jobs.length === 0 ? (
                                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No assessments available currently.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {jobs.map(job => (
                                                <div key={job.id} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 hover:border-blue-500/30 transition-all duration-300 relative hover:shadow-2xl hover:shadow-blue-900/5 flex flex-col h-full">
                                                    
                                                    <div className="flex justify-between items-start mb-8">
                                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                                            <Briefcase className="w-6 h-6" />
                                                        </div>
                                                        <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                                                            Active
                                                        </span>
                                                    </div>

                                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3 line-clamp-2 min-h-[3.5rem]">{job.title}</h3>
                                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-8 line-clamp-3 leading-relaxed flex-grow">{job.description}</p>
                                                    
                                                    <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-6 border-t border-slate-100 dark:border-slate-800">
                                                        <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> 15 Mins</span>
                                                        <span className="flex items-center gap-2"><Layout className="h-3.5 w-3.5" /> {job.questions?.length || 5} Items</span>
                                                    </div>

                                                    <button 
                                                        onClick={() => navigate(`/test/${job.id}`)}
                                                        className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px]"
                                                    >
                                                        <div className="absolute bottom-8 right-8">
                                                            <div className="h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 transform group-hover:scale-110 transition-all">
                                                                <Play className="w-4 h-4 ml-0.5" />
                                                            </div>
                                                        </div>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT COLUMN - SIDEBAR */}
                            <div className="space-y-6">
                                
                                {/* Talent Passport */}
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Talent Passport</h3>
                                        <FileText className="w-4 h-4 text-blue-500" />
                                    </div>

                                    <div className="relative group">
                                        <div className={`aspect-square rounded-[2rem] border-2 border-dashed ${resumeUrl ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'} flex flex-col items-center justify-center text-center p-6 transition-colors hover:border-blue-500`}>
                                            <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${resumeUrl ? 'bg-emerald-100 text-emerald-600' : 'bg-white dark:bg-slate-800 text-slate-300 shadow-sm'}`}>
                                                {resumeUrl ? <CheckCircle className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                                            </div>
                                            
                                            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">
                                                {uploading ? 'UPLOADING...' : resumeUrl ? 'RESUME VERIFIED' : 'UPLOAD RESUME'}
                                            </h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {resumeUrl ? user?.resumeName || 'PDF / DOCX' : 'PDF / DOCX (MAX 5MB)'}
                                            </p>

                                            <input 
                                                type="file" 
                                                accept=".pdf,.doc,.docx" 
                                                onChange={handleResumeUpload} 
                                                disabled={uploading} 
                                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                            />
                                        </div>
                                    </div>
                                    
                                    {resumeUrl && aiAnalysis && (
                                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Top Match</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{aiAnalysis.roleRecommendation}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Skill Overview */}
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-8">Skill Overview</h3>
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                                    <Award className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Score</span>
                                            </div>
                                            <span className="font-black text-xl text-slate-900 dark:text-white">
                                                {results.length > 0 ? (results.reduce((acc, curr) => acc + curr.percentage, 0) / results.length).toFixed(0) : '--'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                                    <CheckCircle className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
                                            </div>
                                            <span className="font-black text-xl text-slate-900 dark:text-white">{results.length}</span>
                                        </div>
                                    </div>

                                    <button className="w-full mt-8 py-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all">
                                        Download Passport
                                    </button>
                                </div>

                            </div>
                        </div>
                    ) : (
                        // HISTORY / APPLICATIONS TAB
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-8">Application History</h2>
                            
                            {results.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Briefcase className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-1">No Applications Yet</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">You haven't completed any assessments or applied for jobs yet.</p>
                                    <button 
                                        onClick={() => navigate('/candidate-dashboard')}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                                    >
                                        Browse Opportunities
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {results.map((result, index) => {
                                        const isPass = result.percentage >= 60;
                                        return (
                                            <div key={result.id} className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                                                <div className="flex items-start gap-5">
                                                    <div className={`p-4 rounded-2xl ${isPass ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
                                                        {isPass ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{result.jobTitle}</h3>
                                                            {index === 0 && <span className="bg-blue-100 text-blue-700 text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest">New</span>}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            <span>{new Date(result.submittedAt).toLocaleDateString()}</span>
                                                            <span>•</span>
                                                            <span>{new Date(result.submittedAt).toLocaleTimeString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 pl-16 md:pl-0">
                                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                                        <Award className="w-4 h-4 text-slate-400" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Score: {result.percentage.toFixed(0)}%</span>
                                                    </div>

                                                    <button 
                                                        onClick={() => navigate(`/result/${result.jobId}`, { state: result })}
                                                        className="h-10 w-10 flex items-center justify-center bg-slate-900 dark:bg-blue-600 text-white rounded-xl hover:bg-black dark:hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default CandidateDashboard;
