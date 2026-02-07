import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase'; // Ensure storage is exported from firebase.js
import {
    Briefcase, Play, Clock, Layout, Loader, LogOut, FileText,
    CheckCircle, Search, Upload, Shield, Award, Sparkles, AlertTriangle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { extractTextFromPDF, extractTextFromImage, matchResumeWithJobs } from '../services/resumeMatchingService';

const CandidateDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || null);
    const [processing, setProcessing] = useState(false);
    const [matchResults, setMatchResults] = useState(null);
    const [candidateSummary, setCandidateSummary] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setJobs(jobsData);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
            setLoading(false);
        };
        fetchJobs();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            return;
        }

        setUploading(true);
        setProcessing(true);

        try {
            // Step 1: Upload file to Firebase Storage
            const storageRef = ref(storage, `resumes/${user.uid}/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // Step 2: Extract text using OCR
            let extractedText = '';
            const fileType = file.type;

            if (fileType === 'application/pdf') {
                console.log('Extracting text from PDF...');
                extractedText = await extractTextFromPDF(file);
            } else if (fileType.startsWith('image/')) {
                console.log('Extracting text from image...');
                extractedText = await extractTextFromImage(file);
            } else {
                // For .doc/.docx, we'll store the file but skip OCR for now
                console.log('Document uploaded. OCR skipped for this file type.');
                extractedText = 'Document uploaded - manual review required';
            }

            console.log('Extracted text length:', extractedText.length);

            // Step 3: Match resume with available jobs using AI
            let aiMatchResults = null;
            let candidateProfile = null;

            if (extractedText && extractedText.length > 50 && jobs.length > 0) {
                console.log('Matching resume with jobs...');
                const matchingResults = await matchResumeWithJobs(extractedText, jobs);
                aiMatchResults = matchingResults.rankedJobs;
                candidateProfile = matchingResults.candidateSummary;

                console.log('AI Matching completed:', aiMatchResults.length, 'jobs ranked');
                setMatchResults(aiMatchResults);
                setCandidateSummary(candidateProfile);
            }

            // Step 4: Update user profile in Firestore
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                resumeUrl: downloadURL,
                resumeName: file.name,
                resumeText: extractedText.substring(0, 10000), // Store first 10k chars
                resumeUpdatedAt: new Date().toISOString(),
                aiCandidateSummary: candidateProfile || null
            });

            setResumeUrl(downloadURL);
            alert("Resume uploaded and analyzed successfully!");

        } catch (error) {
            console.error("Error processing resume:", error);
            alert(`Failed to process resume: ${error.message}`);
        } finally {
            setUploading(false);
            setProcessing(false);
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
                            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Explorer Dashboard</h1>
                            <span className="text-slate-300 dark:text-slate-600 text-lg">/</span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wide text-sm border-b-2 border-blue-600 dark:border-blue-400 pb-0.5">Opportunities</span>
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

                <div className="flex-1 overflow-auto p-4 md:p-8 space-y-8 scroll-smooth">

                    {/* Hero Section & Stats Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Hero Banner */}
                        <div className="lg:col-span-2 bg-[#0a101f] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-blue-900/20 text-white flex flex-col justify-center min-h-[320px]">
                            {/* Background Elements */}
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

                            <div className="relative z-10 max-w-xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest mb-6 text-blue-300">
                                    <Sparkles className="w-3 h-3" /> System Status: Online
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
                                    PROVE YOUR <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">EXPERTISE.</span>
                                </h2>
                                <p className="text-slate-400 text-lg mb-8 max-w-md font-medium leading-relaxed">
                                    Browse active job missions and complete assessments to get verified skill reports.
                                </p>

                                {!resumeUrl && (
                                    <div className="inline-flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl animate-pulse">
                                        <AlertTriangle className="text-amber-500 w-5 h-5 flex-shrink-0" />
                                        <p className="text-xs font-bold text-amber-200 uppercase tracking-wide">
                                            Resume Missing! Upload your resume to enable AI skill matching.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Decorative Star */}
                            <div className="absolute top-12 right-12 text-white/5 transform rotate-12 pointer-events-none">
                                <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                            </div>
                        </div>

                        {/* Talent Passport Widget */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col h-full relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Talent Passport</h3>
                                <div className="p-2 bg-blue-50 dark:bg-slate-800 rounded-xl text-blue-600 dark:text-blue-400">
                                    <FileText className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 group cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all relative">
                                    {resumeUrl ? (
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                    ) : (
                                        <Upload className="w-8 h-8 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    )}
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,image/*"
                                        onChange={handleResumeUpload}
                                        disabled={uploading}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>

                                {uploading || processing ? (
                                    <div className="text-center">
                                        <Loader className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                            {uploading && !processing ? 'Uploading...' : processing ? 'Analyzing Resume...' : 'Processing...'}
                                        </p>
                                    </div>
                                ) : resumeUrl ? (
                                    <div>
                                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg mb-1">Resume Verified</h4>
                                        <p className="text-xs font-medium text-emerald-600 uppercase tracking-widest">Ready for analysis</p>
                                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="mt-4 text-[10px] font-bold text-blue-600 hover:underline block uppercase tracking-widest">View Document</a>
                                    </div>
                                ) : (
                                    <div>
                                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg mb-1">Upload Resume</h4>
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">PDF / DOCX (Max 5MB)</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 w-full">
                                <button className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
                                    {uploading ? 'Processing...' : (
                                        <>
                                            {resumeUrl ? 'Update Resume' : 'Select File'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Skill Overview</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Avg. Score</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white">--</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                                <Award className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Completed</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white">0</p>
                            </div>
                            <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* AI Matched Jobs Section - Show only if resume has been analyzed */}
                    {matchResults && matchResults.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6 px-2">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">AI Recommended For You</h2>
                                    <div className="px-2 py-1 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Powered by AI</span>
                                    </div>
                                </div>
                            </div>

                            {candidateSummary && (
                                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">Your Profile Summary</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Primary Skills</p>
                                            <p className="font-bold text-slate-900 dark:text-white">{candidateSummary.primarySkills?.join(', ') || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Experience Level</p>
                                            <p className="font-bold text-slate-900 dark:text-white">{candidateSummary.experienceLevel || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Key Strengths</p>
                                            <p className="font-bold text-slate-900 dark:text-white">{candidateSummary.strengths?.slice(0, 2).join(', ') || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {matchResults.slice(0, 4).map(job => (
                                    <div key={job.id} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden">

                                        {/* Match Score Badge */}
                                        <div className="absolute top-6 right-6">
                                            <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${job.aiMatch.matchScore >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                                                job.aiMatch.matchScore >= 60 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                                                    'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                                }`}>
                                                {job.aiMatch.matchScore}% Match
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                                                <Sparkles className="w-6 h-6" />
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 line-clamp-1">{job.title}</h3>
                                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">{job.aiMatch.recommendation}</p>

                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed font-medium">{job.aiMatch.matchReason}</p>

                                        {/* Matching Skills */}
                                        {job.aiMatch.matchingSkills && job.aiMatch.matchingSkills.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Matching Skills</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.aiMatch.matchingSkills.slice(0, 3).map((skill, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold rounded-lg border border-emerald-200 dark:border-emerald-800">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Missing Skills */}
                                        {job.aiMatch.missingSkills && job.aiMatch.missingSkills.length > 0 && (
                                            <div className="mb-6">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Skills to Improve</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.aiMatch.missingSkills.slice(0, 2).map((skill, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-bold rounded-lg border border-slate-200 dark:border-slate-700">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                                            <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> 15 Mins</span>
                                            <span className="flex items-center gap-1.5"><Layout className="h-3 w-3" /> {job.questions?.length || 5} Items</span>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/test/${job.id}`)}
                                            className="w-full bg-blue-600 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-600/20"
                                        >
                                            Start Assessment <Play className="h-3 w-3 fill-current" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assessments Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Open Assessments</h2>
                            <div className="relative hidden md:block">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    placeholder="Search Missions..."
                                    className="h-10 pl-10 pr-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-20">
                                <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Configuration...</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No assessments available currently.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {jobs.map(job => (
                                    <div key={job.id} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden">

                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${job.experienceLevel === 'Fresher' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
                                                ACTIVE
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 line-clamp-1">{job.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 h-10 leading-relaxed font-medium">{job.description}</p>

                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
                                            <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> 15 Mins</span>
                                            <span className="flex items-center gap-1.5"><Layout className="h-3 w-3" /> {job.questions?.length || 5} Items</span>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/test/${job.id}`)}
                                            className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95 shadow-lg shadow-slate-200 dark:shadow-blue-900/20"
                                        >
                                            Start Test <Play className="h-3 w-3 fill-current" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CandidateDashboard;
