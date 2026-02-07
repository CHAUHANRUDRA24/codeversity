import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { questionBank } from '../data/questionBank';

const CreateJob = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [jobTitle, setJobTitle] = useState('Senior Frontend Engineer');
    const [experience, setExperience] = useState('Senior');
    const [jd, setJd] = useState('We are looking for a Senior Frontend Engineer to join our core product team. You will be responsible for building high-performance web applications using React and TypeScript.\n\nKey Responsibilities:\n- Develop new user-facing features.\n- Build reusable code and libraries for future use.\n- Ensure the technical feasibility of UI/UX designs.\n- Optimize application for maximum speed and scalability.\n\nRequirements:\n- Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model.\n- Thorough understanding of React.js and its core principles.\n- Experience with popular React.js workflows (such as Flux or Redux).\n- Familiarity with newer specifications of EcmaScript.');
    const [loading, setLoading] = useState(false);

    const handleCreateJob = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Select 5 random questions
            const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
            const selectedQuestions = shuffled.slice(0, 5);

            await addDoc(collection(db, "jobs"), {
                title: jobTitle,
                description: jd,
                experienceLevel: experience,
                createdBy: user.uid,
                questions: selectedQuestions,
                createdAt: new Date().toISOString()
            });

            navigate('/recruiter-dashboard');
        } catch (error) {
            console.error("Error creating job:", error);
            alert("Failed to create job. Please try again.");
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f7f8] dark:bg-[#101822] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-200">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-colors duration-200 hidden md:flex">
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col px-2 py-2">
                        <h1 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">IntelliHire</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Recruiter Admin</p>
                    </div>
                    <nav className="flex flex-col gap-1">
                        <button onClick={() => navigate('/recruiter-dashboard')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group w-full text-left">
                            <span className="material-symbols-outlined text-[24px] group-hover:text-blue-600 transition-colors">dashboard</span>
                            <span className="text-sm font-medium">Dashboard</span>
                        </button>
                        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-600 dark:bg-blue-600/20 w-full text-left">
                            <span className="material-symbols-outlined text-[24px] fill-1">work</span>
                            <span className="text-sm font-medium">Create Job</span>
                        </button>
                        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-500 group w-full text-left mt-auto">
                            <span className="material-symbols-outlined text-[24px] group-hover:text-red-600 transition-colors">logout</span>
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </nav>
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-slate-800">
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.email}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Recruiter</p>
                        </div>
                    </div>
                </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f6f7f8] dark:bg-[#101822] relative">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
                            <a className="hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate('/recruiter-dashboard')}>Dashboard</a>
                            <span className="material-symbols-outlined text-base mx-2 text-slate-400">chevron_right</span>
                            <span className="text-slate-900 dark:text-white font-semibold">Create New Job</span>
                        </nav>
                    </div>
                </header>
                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:px-12 scroll-smooth">
                    <div className="max-w-6xl mx-auto space-y-8 pb-10">
                        {/* Section: Job Configuration */}
                        <section className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Create New Job</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">Define the role details and we'll attach a rigorous assessment.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCreateJob}
                                        disabled={loading}
                                        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 dark:shadow-none flex items-center gap-2 border-none cursor-pointer disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">check</span>
                                        {loading ? 'Publishing...' : 'Publish Job & Test'}
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="jobTitle">Job Title</label>
                                            <input
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none"
                                                id="jobTitle"
                                                placeholder="e.g. Senior Frontend Engineer"
                                                type="text"
                                                value={jobTitle}
                                                onChange={(e) => setJobTitle(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="experience">Experience Level</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none appearance-none cursor-pointer"
                                                    id="experience"
                                                    value={experience}
                                                    onChange={(e) => setExperience(e.target.value)}
                                                >
                                                    <option value="Fresher">Entry Level (0-2 years)</option>
                                                    <option value="Mid">Mid Level (2-5 years)</option>
                                                    <option value="Senior">Senior Level (5+ years)</option>
                                                </select>
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                    <span className="material-symbols-outlined">expand_more</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="jd">Job Description</label>
                                            <span className="text-xs text-slate-400">{jd.length} / 5,000 chars</span>
                                        </div>
                                        <textarea
                                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none resize-none"
                                            id="jd"
                                            placeholder="Paste the full job description here..."
                                            rows="6"
                                            value={jd}
                                            onChange={(e) => setJd(e.target.value)}
                                        ></textarea>
                                    </div>
                                </form>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateJob;
