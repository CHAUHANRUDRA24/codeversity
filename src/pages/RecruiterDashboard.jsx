import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Create Job State
    const [jobForm, setJobForm] = useState({
        title: 'Senior Frontend Engineer',
        experience: 'Senior Level (5+ years)',
        description: `We are looking for a Senior Frontend Engineer to join our core product team. You will be responsible for building high-performance web applications using React and TypeScript. 

Key Responsibilities:
- Develop new user-facing features.
- Build reusable code and libraries for future use.
- Ensure the technical feasibility of UI/UX designs.
- Optimize application for maximum speed and scalability.

Requirements:
- Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model.
- Thorough understanding of React.js and its core principles.
- Experience with popular React.js workflows (such as Flux or Redux).
- Familiarity with newer specifications of EcmaScript.`
    });
    const [skills, setSkills] = useState(['React.js', 'TypeScript', 'Redux', 'Performance Opt']);
    const [generated, setGenerated] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [questions, setQuestions] = useState([
        {
            id: 1,
            tag: 'React Core', tagColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
            time: '5 mins',
            text: 'Can you describe the Virtual DOM in React and explain how it differs from the real DOM? Walk me through how React handles updates efficiently.'
        },
        {
            id: 2,
            tag: 'State Management', tagColor: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
            time: '8 mins',
            text: 'Imagine you have a complex dashboard with multiple widgets that share data. How would you design the state management architecture? When would you choose Redux over React Context?'
        },
        {
            id: 3,
            tag: 'Performance', tagColor: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
            time: '6 mins',
            text: 'We noticed our application slows down when rendering large lists of data. What strategies or tools (e.g., React.memo, useMemo, virtualization) would you employ to diagnose and fix this?'
        },
        {
            id: 4,
            tag: 'Behavioral', tagColor: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
            time: '5 mins',
            text: 'Tell me about a time you disagreed with a design decision provided by the UX team. How did you handle the situation and what was the outcome?'
        }
    ]);

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate AI delay
        setTimeout(() => {
            setIsGenerating(false);
            setGenerated(true);
        }, 1500);
    };

    const handleAddSkill = () => {
        const newSkill = prompt("Enter skill name:");
        if (newSkill) setSkills([...skills, newSkill]);
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleRemoveQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const [candidates] = useState([
        { id: 1, rank: 1, name: 'Jane Doe', email: 'jane.doe@example.com', role: 'Senior React Dev', score: 98, status: 'Interview Ready', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU5z_Z8syXWVwgjr2x35OeDQhyxpWb2MQAIA73Amn_6YQs2HZGwGUiUg6FFyGx6rBcecDq8OQwP2hiIEJ7XyqBehOXaaFvSBXl3eHJjJMwjEubKexsSLAY93lj8-r3LbJq5PriAMkBjE6SBV63SBkbxzwQfzUA8878cNqHN5H686s8ni0972cB_hP-_7otXev3IROd46-fwj7XhQEjSBOG50Gf2uRFcReWIVWtW7wb4tpLwAJPMOKZ0do3ZSJdlJgp84cOEYm_iQ' },
        { id: 2, rank: 2, name: 'John Smith', email: 'john.smith@example.com', role: 'Backend Engineer', score: 94, status: 'Reviewing', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmaR4GBP4eMCPjOf3_Jyzm1VmIOXN-SFYD1f8gkdxh6vq08dk94Inol07kTEe9Yi1ohGZ25CA-kITjgAg2DQLzO-W5WXKq_GZjsBbdSy6BAjYg0Xh2myGFiLZF-6wPfsg-xIhiJuQxBgHG9rUkHSElD56RIRTMKL8h6vAmxVvOtOG2ixyX-eJmdK3_wXOE0tU96VZxxlJrm0vxLTU6-_ncd9phbcaFoFqp69IlXAq_bTyjXe7_d2BVMByXdnB2hV9ZosjIVD1NpQ' },
        { id: 3, rank: 3, name: 'Alice Cooper', email: 'alice.c@example.com', role: 'Product Designer', score: 89, status: 'Technical', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXu3zGqzOp0woETcR9XBfn389zTxSMxxolUSfNwSxpkavqEw0dk04xaj0fnz5REleGirNe_EA18nv62wS7kRWuCkqYvwXAexa-WN-ZIV-qs4DkmL3kqQ0uotIaV_9VkxsZHv1Pubp2uFsSo48U1piAeQd0k45EoYv-rR90OypbwA0zsUY2qCsnlNVYUc44fG0HHFBiMTeG0EgOfU2xponSn2SGBRFBB4wruIbot2DgrqVyLEzgv0YCfOlrUJENwgkMsk3_CYCoxg' },
        { id: 4, rank: 4, name: 'Marcus Johnson', email: 'marcus.j@example.com', role: 'Data Scientist', score: 88, status: 'Reviewing', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSGCxn7rgif8wgQJ30hSDPS8U6P9VbzvSO50_thp94LkM-vwpsDmfoUI7IR4mKsjtd1Enlm2iFPSi2QoVosqWF9XbNcqDOg_bBmudwmgKZn7Zd1JOeE4AhaDI9y-wITOn07XPhBsblBYh0ax3B_guvw7W7pFuzRlV_K4hA5BHxIMTy7fO8JIciSNF1TVgJLS-nYEjzsK8e9Ervt0e8P-Y0fgzKUXhsVvSQzL6ng1y0lLDx2-3EkAuTQKWjInalLRAAJlXEU6XkMA' },
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Interview Ready': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Reviewing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Technical': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusDot = (status) => {
        switch (status) {
            case 'Interview Ready': return 'bg-green-500';
            case 'Reviewing': return 'bg-yellow-500';
            case 'Technical': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderOverview = () => (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Today is {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, Sarah! 👋</h3>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-2.5 outline-none">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Quarter</option>
                    </select>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1a2432] p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                            <span className="material-symbols-outlined">group</span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span> 12%
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Applicants</p>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">1,240</h4>
                </div>

                <div className="bg-white dark:bg-[#1a2432] p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                            <span className="material-symbols-outlined">assignment_turned_in</span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span> 5%
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Completed Tests</p>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">856</h4>
                </div>

                <div className="bg-white dark:bg-[#1a2432] p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                            <span className="material-symbols-outlined">star</span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>remove</span> 0%
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Shortlisted</p>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">42</h4>
                </div>

                <div className="bg-white dark:bg-[#1a2432] p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-teal-600 dark:text-teal-400">
                            <span className="material-symbols-outlined">score</span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span> 1.5%
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Avg. Score</p>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">78<span className="text-sm text-gray-400 font-normal">/100</span></h4>
                </div>
            </div>

            {/* Main Grid: Chart & Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Skill Performance Chart (Simplified Bar Visualization) */}
                <div className="lg:col-span-1 bg-white dark:bg-[#1a2432] p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Skill Performance</h3>
                        <button className="text-blue-600 text-sm font-medium hover:underline bg-transparent border-none cursor-pointer">View Details</button>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                        <div className="flex items-end justify-between h-48 gap-2 px-2">
                            {[
                                { label: 'Python', val: 60, col: 'bg-blue-600' },
                                { label: 'React', val: 75, col: 'bg-blue-600' },
                                { label: 'SQL', val: 45, col: 'bg-blue-600' },
                                { label: 'Node', val: 88, col: 'bg-blue-600' },
                                { label: 'Design', val: 92, col: 'bg-teal-400' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group w-full">
                                    <div className="relative w-full bg-blue-50 dark:bg-gray-800 rounded-t-md overflow-hidden h-40 flex items-end">
                                        <div className={`w-full ${item.col} opacity-80 group-hover:opacity-100 transition-all duration-500 rounded-t-md relative`} style={{ height: `${item.val}%` }}>
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity">{item.val}%</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Weekly Avg</span>
                                <span className="font-bold text-gray-900 dark:text-white">78%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ranking Table */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1a2432] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Candidates</h3>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-none cursor-pointer">
                                <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
                            </button>
                            <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-none cursor-pointer">
                                <span className="material-symbols-outlined text-[18px]">download</span> Export
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Rank</th>
                                    <th className="px-6 py-4 font-semibold">Candidate</th>
                                    <th className="px-6 py-4 font-semibold">Role</th>
                                    <th className="px-6 py-4 font-semibold">Score</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredCandidates.length > 0 ? (
                                    filteredCandidates.map((candidate) => (
                                        <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                <div className={`w-8 h-8 rounded-full ${candidate.rank === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'} flex items-center justify-center font-bold`}>
                                                    {candidate.rank}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img alt={candidate.name} className="w-10 h-10 rounded-full object-cover" src={candidate.avatar} />
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">{candidate.name}</div>
                                                        <div className="text-xs text-gray-500">{candidate.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{candidate.role}</td>
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{candidate.score}<span className="text-xs text-gray-400 font-normal">/100</span></td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(candidate.status)}`}></span>
                                                    {candidate.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm bg-transparent border-none cursor-pointer">View Profile</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No candidates found matching "{searchQuery}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Showing {filteredCandidates.length} of {candidates.length} candidates</span>
                        <div className="flex gap-2">
                            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-50 border-none cursor-pointer bg-transparent">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 border-none cursor-pointer bg-transparent">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCreateJob = () => (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Section: Job Configuration */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Create New Job</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Define the role details to let our AI assist with the screening process.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm cursor-pointer">
                            Save Draft
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 dark:shadow-none flex items-center gap-2 cursor-pointer border-none ${isGenerating ? 'opacity-75 cursor-wait' : ''}`}
                        >
                            {isGenerating ? (
                                <>
                                    <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                                    Generate AI Assessment
                                </>
                            )}
                        </button>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a2432] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="jobTitle">Job Title</label>
                                <input
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none"
                                    id="jobTitle"
                                    type="text"
                                    value={jobForm.title}
                                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="experience">Experience Level</label>
                                <div className="relative">
                                    <select
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none appearance-none cursor-pointer"
                                        id="experience"
                                        value={jobForm.experience}
                                        onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                                    >
                                        <option>Entry Level (0-2 years)</option>
                                        <option>Mid Level (2-5 years)</option>
                                        <option>Senior Level (5+ years)</option>
                                        <option>Executive</option>
                                    </select>
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="jd">Job Description</label>
                                <span className="text-xs text-gray-400">{jobForm.description.length} chars</span>
                            </div>
                            <textarea
                                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none resize-none"
                                id="jd"
                                rows="6"
                                value={jobForm.description}
                                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                            ></textarea>
                        </div>
                    </form>
                </div>
            </section>

            {/* AI Output Section - Conditionally Rendered */}
            {generated && (
                <div className="animate-fade-in-up space-y-8">
                    {/* Divider with AI Badge */}
                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600 text-lg">psychology</span>
                            AI Generated Assessment Preview
                        </span>
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                    </div>

                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Col: Insights */}
                        <div className="space-y-6">
                            {/* Extracted Skills */}
                            <div className="bg-white dark:bg-[#1a2432] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">label</span>
                                        Extracted Skills
                                    </h3>
                                    <button className="text-blue-600 text-xs font-medium hover:underline bg-transparent border-none cursor-pointer">Edit</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-600/10 text-blue-600 border border-blue-600/10">
                                            {skill}
                                            <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500 flex items-center bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined text-[16px]">close</span></button>
                                        </span>
                                    ))}
                                    <button onClick={handleAddSkill} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 border-dashed bg-transparent cursor-pointer">
                                        <span className="material-symbols-outlined text-[16px]">add</span> Add Skill
                                    </button>
                                </div>
                            </div>

                            {/* Skill Weights */}
                            <div className="bg-white dark:bg-[#1a2432] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-blue-600">equalizer</span>
                                    Skill Weighting
                                </h3>
                                <div className="space-y-5">
                                    {[
                                        { label: 'Technical Skills', val: 70, color: 'bg-blue-600' },
                                        { label: 'System Design', val: 20, color: 'bg-blue-400' },
                                        { label: 'Soft Skills', val: 10, color: 'bg-blue-300' }
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <div className="flex justify-between text-sm mb-1.5">
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{item.val}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                                                <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${item.val}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
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
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-600">quiz</span>
                                    Generated Interview Questions ({questions.length})
                                </h3>
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer">
                                        <span className="material-symbols-outlined">refresh</span>
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer">
                                        <span className="material-symbols-outlined">download</span>
                                    </button>
                                </div>
                            </div>

                            {questions.map((q) => (
                                <div key={q.id} className="group bg-white dark:bg-[#1a2432] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:border-blue-600/50 transition-colors cursor-pointer">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`${q.tagColor} text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide`}>{q.tag}</span>
                                                <span className="text-xs text-gray-400 font-medium">Approx {q.time}</span>
                                            </div>
                                            <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">{q.text}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 bg-transparent border-none cursor-pointer">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button onClick={() => handleRemoveQuestion(q.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 dark:hover:bg-gray-800 bg-transparent border-none cursor-pointer">
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add Question Button */}
                            <button className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-600 hover:border-blue-600/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all flex items-center justify-center gap-2 font-medium bg-transparent cursor-pointer">
                                <span className="material-symbols-outlined">add_circle</span>
                                Add Custom Question
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex h-screen w-full bg-[#f6f7f8] dark:bg-[#101822] text-gray-900 dark:text-gray-100 antialiased overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#1a2432] border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex md:flex-col`}>
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-blue-600/10 rounded-lg p-2 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '28px' }}>hub</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-tight">IntelliHire</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Recruiter Platform</p>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-gray-500">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 gap-2 flex flex-col overflow-y-auto">
                    {[
                        { id: 'overview', icon: 'dashboard', label: 'Overview' },
                        { id: 'create-job', icon: 'add_box', label: 'Create Job' },
                        { id: 'candidates', icon: 'group', label: 'Candidates' },
                        { id: 'analytics', icon: 'bar_chart', label: 'Analytics' },
                        { id: 'jobs', icon: 'work', label: 'Jobs' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left border-none cursor-pointer ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    ))}

                    <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">System</p>

                    <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all w-full text-left border-none cursor-pointer">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="text-sm font-medium">Settings</span>
                    </button>
                    <button onClick={() => navigate('/login')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all w-full text-left border-none cursor-pointer">
                        <span className="material-symbols-outlined">logout</span>
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                        <div className="relative">
                            <img alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh4jIPTPrEAW2Vp4EHkU0TEwutgmBvzBKKECHcHDnnAoj7811QI9SHFHu70vT3TfEc0xv_BVeRIqmyJrjt-oqeEPhZjep8vNI-c_tlK3-WNRYYIGA1zxvZd8vI3gjcVT0tO9_2Zjp3jfroOiuyHw4FGzySk_ExHHPAMaV4RsDn6LN8eL9p-6nS_P1CwrW9OJF9Q6mDvpMnqz1bRxXhIXUqPyh69xqobGXjHHW734lowiaFuCoiW2MBZ0nlZe6VDxuzCV4PXlBypw" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">Sarah Connor</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">Senior Recruiter</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#1a2432] border-b border-gray-200 dark:border-gray-700 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border-none cursor-pointer">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{activeTab.replace('-', ' ')}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex relative group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">search</span>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 w-64 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 placeholder-gray-400 outline-none"
                                placeholder="Search candidates..."
                                type="text"
                            />
                        </div>

                        <button onClick={() => setActiveTab('create-job')} className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-600/30 border-none cursor-pointer">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                            Create New Job
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'create-job' && renderCreateJob()}
                    {activeTab !== 'overview' && activeTab !== 'create-job' && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                                <span className="material-symbols-outlined text-4xl text-gray-400">construction</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Under Construction</h3>
                            <p className="text-gray-500">The <span className="font-semibold capitalize">{activeTab}</span> page is coming soon.</p>
                            <button onClick={() => setActiveTab('overview')} className="mt-6 text-blue-600 font-medium hover:underline border-none bg-transparent cursor-pointer">Back to Overview</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RecruiterDashboard;
