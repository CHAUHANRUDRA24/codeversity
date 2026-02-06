import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateJob = () => {
    const navigate = useNavigate();
    const [jobTitle, setJobTitle] = useState('Senior Frontend Engineer');
    const [experience, setExperience] = useState('Senior Level (5+ years)');
    const [jd, setJd] = useState('We are looking for a Senior Frontend Engineer to join our core product team. You will be responsible for building high-performance web applications using React and TypeScript.\n\nKey Responsibilities:\n- Develop new user-facing features.\n- Build reusable code and libraries for future use.\n- Ensure the technical feasibility of UI/UX designs.\n- Optimize application for maximum speed and scalability.\n\nRequirements:\n- Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model.\n- Thorough understanding of React.js and its core principles.\n- Experience with popular React.js workflows (such as Flux or Redux).\n- Familiarity with newer specifications of EcmaScript.');

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
                            <span className="text-sm font-medium">Jobs</span>
                        </button>
                        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group w-full text-left">
                            <span className="material-symbols-outlined text-[24px] group-hover:text-blue-600 transition-colors">group</span>
                            <span className="text-sm font-medium">Candidates</span>
                        </button>
                        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group w-full text-left">
                            <span className="material-symbols-outlined text-[24px] group-hover:text-blue-600 transition-colors">assignment</span>
                            <span className="text-sm font-medium">Assessments</span>
                        </button>
                        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group w-full text-left">
                            <span className="material-symbols-outlined text-[24px] group-hover:text-blue-600 transition-colors">settings</span>
                            <span className="text-sm font-medium">Settings</span>
                        </button>
                    </nav>
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCUtUiO_DfY-49yfRZ-1c2faPMOvzrmGAFMG-D2q6zymzhkPGalqjYl1atMFJVDiMfg83mR_hDBUpZQ541BFzSZIDyI16G-jpmby2DcnPzyJAWqBVjyofU4GcDZcn9Ck8NwiGyRjapT0tbdefnk9fsqgp47bTCjwKRmMQbqLfIDXkSlWfvBwHZADOYfDR9QDcxkdLc0OfRVmNfzNacKgHRGDkIgvrFXZ8xaueoGv_7g9FqGP3NeC8rfgvKqTMKiX3G1Jf8ujGqAfA')" }}></div>
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Alex Morgan</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">alex@intellihire.com</p>
                        </div>
                    </div>
                </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f6f7f8] dark:bg-[#101822] relative">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500 hover:text-slate-700">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
                            <a className="hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate('/recruiter-dashboard')}>Dashboard</a>
                            <span className="material-symbols-outlined text-base mx-2 text-slate-400">chevron_right</span>
                            <a className="hover:text-blue-600 transition-colors cursor-pointer">Jobs</a>
                            <span className="material-symbols-outlined text-base mx-2 text-slate-400">chevron_right</span>
                            <span className="text-slate-900 dark:text-white font-semibold">Create New Job</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent border-none cursor-pointer">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <button className="p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent border-none cursor-pointer">
                            <span className="material-symbols-outlined">help</span>
                        </button>
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
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">Define the role details to let our AI assist with the screening process.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer">
                                        Save Draft
                                    </button>
                                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 dark:shadow-none flex items-center gap-2 border-none cursor-pointer">
                                        <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                                        Generate AI Assessment
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
                                                    <option>Entry Level (0-2 years)</option>
                                                    <option>Mid Level (2-5 years)</option>
                                                    <option>Senior Level (5+ years)</option>
                                                    <option>Executive</option>
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
                        {/* Divider with AI Badge */}
                        <div className="relative flex py-5 items-center">
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600 text-lg">psychology</span>
                                AI Generated Assessment Preview
                            </span>
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                        </div>
                        {/* Section: AI Output (Mocked) */}
                        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
                            {/* Left Col: Insights */}
                            <div className="space-y-6">
                                {/* Extracted Skills */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-blue-600">label</span>
                                            Extracted Skills
                                        </h3>
                                        <button className="text-blue-600 text-xs font-medium hover:underline bg-transparent border-none cursor-pointer">Edit</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['React.js', 'TypeScript', 'Redux', 'Performance Opt'].map(skill => (
                                            <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-600/10 text-blue-600 border border-blue-600/10">
                                                {skill}
                                                <button className="hover:text-red-500 flex items-center bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined text-[16px]">close</span></button>
                                            </span>
                                        ))}
                                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border-dashed bg-transparent cursor-pointer">
                                            <span className="material-symbols-outlined text-[16px]">add</span> Add Skill
                                        </button>
                                    </div>
                                </div>
                                {/* Skill Weights */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                        <span className="material-symbols-outlined text-blue-600">equalizer</span>
                                        Skill Weighting
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1.5">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">Technical Skills</span>
                                                <span className="font-bold text-slate-900 dark:text-white">70%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1.5">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">System Design</span>
                                                <span className="font-bold text-slate-900 dark:text-white">20%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                                <div className="bg-blue-400 h-2.5 rounded-full" style={{ width: '20%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1.5">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">Soft Skills</span>
                                                <span className="font-bold text-slate-900 dark:text-white">10%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                                <div className="bg-blue-300 h-2.5 rounded-full" style={{ width: '10%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex gap-3 items-start">
                                        <span className="material-symbols-outlined text-blue-600 text-xl mt-0.5">info</span>
                                        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                                            Weights determine the frequency of questions related to each category in the final interview script.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Right Col: Questions */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">quiz</span>
                                        Generated Interview Questions (5)
                                    </h3>
                                    <div className="flex gap-2">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer">
                                            <span className="material-symbols-outlined">refresh</span>
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer">
                                            <span className="material-symbols-outlined">download</span>
                                        </button>
                                    </div>
                                </div>
                                {/* Question Cards */}
                                <div className="space-y-4">
                                    <div className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-600/50 transition-colors cursor-pointer">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">React Core</span>
                                                    <span className="text-xs text-slate-400 font-medium">Approx 5 mins</span>
                                                </div>
                                                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                                                    Can you describe the Virtual DOM in React and explain how it differs from the real DOM? Walk me through how React handles updates efficiently.
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                                                <button className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                     <div className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-600/50 transition-colors cursor-pointer">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">State Management</span>
                                                    <span className="text-xs text-slate-400 font-medium">Approx 8 mins</span>
                                                </div>
                                                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                                                    Imagine you have a complex dashboard with multiple widgets that share data. How would you design the state management architecture? When would you choose Redux over React Context?
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                                                <button className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-600/50 transition-colors cursor-pointer">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">Performance</span>
                                                    <span className="text-xs text-slate-400 font-medium">Approx 6 mins</span>
                                                </div>
                                                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                                                    We noticed our application slows down when rendering large lists of data. What strategies or tools (e.g., React.memo, useMemo, virtualization) would you employ to diagnose and fix this?
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                                                <button className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                                            </div>
                                        </div>
                                    </div>

                                     <div className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-600/50 transition-colors cursor-pointer">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">Behavioral</span>
                                                    <span className="text-xs text-slate-400 font-medium">Approx 5 mins</span>
                                                </div>
                                                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                                                    Tell me about a time you disagreed with a design decision provided by the UX team. How did you handle the situation and what was the outcome?
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                                                <button className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Add Question Button */}
                                <button className="w-full py-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 hover:border-blue-600/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 font-medium bg-transparent cursor-pointer">
                                    <span className="material-symbols-outlined">add_circle</span>
                                    Add Custom Question
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateJob;
