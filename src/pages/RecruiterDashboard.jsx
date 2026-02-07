import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Briefcase, User, Search, Plus, Filter, Download, MoreHorizontal, LogOut, Loader, Award } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // State
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Fetch Jobs on Mount
    useEffect(() => {
        const fetchJobs = async () => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, "jobs"),
                    where("createdBy", "==", user.uid)
                );
                const querySnapshot = await getDocs(q);
                const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Sort in memory
                jobsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setJobs(jobsData);

                // Select first job by default if available
                if (jobsData.length > 0) {
                    handleViewCandidates(jobsData[0]);
                }
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
            setLoading(false);
        };

        fetchJobs();
    }, [user]);

    // Fetch Candidates for a Job
    const handleViewCandidates = async (job) => {
        setSelectedJob(job);
        setLoadingCandidates(true);
        setCandidates([]);

        try {
            // Get results for this job
            const q = query(
                collection(db, "results"),
                where("jobId", "==", job.id)
            );
            const querySnapshot = await getDocs(q);

            // For each result, fetch the user details to get email/name
            const candidatesData = await Promise.all(querySnapshot.docs.map(async (resDoc) => {
                const result = resDoc.data();
                const userRef = doc(db, "users", result.userId);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.exists() ? userSnap.data() : { email: 'Unknown', name: 'Unknown' };

                return {
                    id: resDoc.id,
                    ...result,
                    user: userData
                };
            }));

            // Sort by percentage descending
            candidatesData.sort((a, b) => b.percentage - a.percentage);

            setCandidates(candidatesData);

        } catch (error) {
            console.error("Error fetching candidates:", error);
        }
        setLoadingCandidates(false);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f7f8] dark:bg-[#101822] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-200">
            {/* Sidebar */}
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
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10 transition-colors duration-200">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">Recruiter Dashboard</h1>
                    <button onClick={() => navigate('/create-job')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> Create New Job
                    </button>
                </header>

                <div className="flex-1 overflow-auto p-6 space-y-6 bg-[#f6f7f8] dark:bg-[#101822] transition-colors duration-200">

                    {/* Jobs List Section */}
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Your Posted Jobs</h2>
                        {loading ? (
                            <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <Loader className="w-6 h-6 animate-spin text-blue-600" />
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <p className="text-slate-500 dark:text-slate-400">No jobs posted yet.</p>
                                <button onClick={() => navigate('/create-job')} className="text-blue-600 font-medium hover:underline mt-2">Create your first job</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {jobs.map(job => (
                                    <div
                                        key={job.id}
                                        onClick={() => handleViewCandidates(job)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedJob?.id === job.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{job.title}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${job.experienceLevel === 'Fresher' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                                                {job.experienceLevel}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{job.description}</p>
                                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
                                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                                                View Candidates &rarr;
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Candidates Table for Selected Job */}
                    {selectedJob && (
                        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[400px] transition-colors duration-200">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Candidates for <span className="text-blue-600 dark:text-blue-400">{selectedJob.title}</span></h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{candidates.length} applicants found</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                        <Download className="w-4 h-4" /> Export CSV
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4">Rank</th>
                                            <th className="px-6 py-4">Candidate</th>
                                            <th className="px-6 py-4">Score</th>
                                            <th className="px-6 py-4">Percentage</th>
                                            <th className="px-6 py-4">Submitted At</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {loadingCandidates ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                                    <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                                                    Loading candidates...
                                                </td>
                                            </tr>
                                        ) : candidates.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                                    No candidates have taken this test yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            candidates.map((candidate, index) => (
                                                <tr key={candidate.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500' : index === 1 ? 'bg-gray-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <div className="font-medium text-slate-900 dark:text-white">{candidate.user?.email}</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">{candidate.user?.role || 'Candidate'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                        {candidate.score} / {candidate.total}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${candidate.percentage >= 60 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                            {candidate.percentage.toFixed(1)}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                                                        {new Date(candidate.submittedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${candidate.percentage >= 80 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : candidate.percentage >= 60 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                            {candidate.percentage >= 60 ? 'Qualified' : 'Not Qualified'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RecruiterDashboard;


