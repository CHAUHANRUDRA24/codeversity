import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RecruiterDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen w-full bg-[#f6f7f8] dark:bg-[#101822] text-gray-900 dark:text-gray-100 antialiased overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-[#1a2432] border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
                {/* Logo Area */}
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-blue-600/10 rounded-lg p-2 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '28px' }}>hub</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-tight">IntelliHire</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Recruiter Platform</p>
                    </div>
                </div>
                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 gap-2 flex flex-col overflow-y-auto">
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600 text-white group transition-all" href="#">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="text-sm font-medium">Overview</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all" href="#">
                        <span className="material-symbols-outlined">add_box</span>
                        <span className="text-sm font-medium">Create Job</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all" href="#">
                        <span className="material-symbols-outlined">group</span>
                        <span className="text-sm font-medium">Candidates</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all" href="#">
                        <span className="material-symbols-outlined">bar_chart</span>
                        <span className="text-sm font-medium">Analytics</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all" href="#">
                        <span className="material-symbols-outlined">work</span>
                        <span className="text-sm font-medium">Jobs</span>
                    </a>
                    <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">System</p>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all" href="#">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="text-sm font-medium">Settings</span>
                    </a>
                    <button onClick={() => navigate('/login')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all w-full text-left">
                        <span className="material-symbols-outlined">logout</span>
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </nav>
                {/* User Profile (Bottom Sidebar) */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                        <div className="relative">
                            <img alt="Profile picture of Sarah" className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh4jIPTPrEAW2Vp4EHkU0TEwutgmBvzBKKECHcHDnnAoj7811QI9SHFHu70vT3TfEc0xv_BVeRIqmyJrjt-oqeEPhZjep8vNI-c_tlK3-WNRYYIGA1zxvZd8vI3gjcVT0tO9_2Zjp3jfroOiuyHw4FGzySk_ExHHPAMaV4RsDn6LN8eL9p-6nS_P1CwrW9OJF9Q6mDvpMnqz1bRxXhIXUqPyh69xqobGXjHHW734lowiaFuCoiW2MBZ0nlZe6VDxuzCV4PXlBypw" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">Sarah Connor</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">Senior Recruiter</span>
                        </div>
                    </div>
                </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#1a2432] border-b border-gray-200 dark:border-gray-700 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="hidden md:flex relative group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">search</span>
                            <input className="pl-10 pr-4 py-2 w-64 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 placeholder-gray-400 outline-none" placeholder="Search candidates..." type="text" />
                        </div>
                        {/* Notifications */}
                        <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border-none bg-transparent cursor-pointer">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900"></span>
                        </button>
                        {/* Create Job Button */}
                        <button className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-600/30 border-none cursor-pointer">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                            Create New Job
                        </button>
                    </div>
                </header>
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Welcome Section */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Today is Monday, 22 Oct 2023</p>
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
                            {/* Stat Card 1 */}
                            <div className="bg-white dark:bg-[#1a2432] p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                        <span className="material-symbols-outlined">group</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span>
                                        12%
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Applicants</p>
                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">1,240</h4>
                            </div>
                            {/* Stat Card 2 */}
                            <div className="bg-white dark:bg-[#1a2432] p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                        <span className="material-symbols-outlined">assignment_turned_in</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span>
                                        5%
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Completed Tests</p>
                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">856</h4>
                            </div>
                            {/* Stat Card 3 */}
                            <div className="bg-white dark:bg-[#1a2432] p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                                        <span className="material-symbols-outlined">star</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>remove</span>
                                        0%
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Shortlisted</p>
                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">42</h4>
                            </div>
                            {/* Stat Card 4 */}
                            <div className="bg-white dark:bg-[#1a2432] p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-teal-600 dark:text-teal-400">
                                        <span className="material-symbols-outlined">score</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span>
                                        1.5%
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Avg. Score</p>
                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">78<span className="text-sm text-gray-400 font-normal">/100</span></h4>
                            </div>
                        </div>
                        {/* Main Grid: Chart & Table */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Skill Performance Analysis Chart */}
                            <div className="lg:col-span-1 bg-white dark:bg-[#1a2432] p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Skill Performance</h3>
                                    <button className="text-blue-600 text-sm font-medium hover:underline bg-transparent border-none cursor-pointer">View Details</button>
                                </div>
                                <div className="flex-1 flex flex-col justify-end">
                                    <div className="flex items-end justify-between h-48 gap-2 sm:gap-4 px-2">
                                        {/* Bar 1 */}
                                        <div className="flex flex-col items-center gap-2 flex-1 group">
                                            <div className="relative w-full bg-blue-50 dark:bg-gray-800 rounded-t-md overflow-hidden h-full flex items-end">
                                                <div className="w-full bg-blue-600/80 group-hover:bg-blue-600 transition-all duration-500 rounded-t-md relative" style={{ height: '60%' }}>
                                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity">60%</div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Python</span>
                                        </div>
                                        {/* Bar 2 */}
                                        <div className="flex flex-col items-center gap-2 flex-1 group">
                                            <div className="relative w-full bg-blue-50 dark:bg-gray-800 rounded-t-md overflow-hidden h-full flex items-end">
                                                <div className="w-full bg-blue-600/80 group-hover:bg-blue-600 transition-all duration-500 rounded-t-md relative" style={{ height: '75%' }}>
                                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity">75%</div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">React</span>
                                        </div>
                                        {/* Bar 3 */}
                                        <div className="flex flex-col items-center gap-2 flex-1 group">
                                            <div className="relative w-full bg-blue-50 dark:bg-gray-800 rounded-t-md overflow-hidden h-full flex items-end">
                                                <div className="w-full bg-blue-600/80 group-hover:bg-blue-600 transition-all duration-500 rounded-t-md relative" style={{ height: '45%' }}>
                                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity">45%</div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">SQL</span>
                                        </div>
                                        {/* Bar 4 */}
                                        <div className="flex flex-col items-center gap-2 flex-1 group">
                                            <div className="relative w-full bg-blue-50 dark:bg-gray-800 rounded-t-md overflow-hidden h-full flex items-end">
                                                <div className="w-full bg-blue-600/80 group-hover:bg-blue-600 transition-all duration-500 rounded-t-md relative" style={{ height: '88%' }}>
                                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity">88%</div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Node</span>
                                        </div>
                                        {/* Bar 5 */}
                                        <div className="flex flex-col items-center gap-2 flex-1 group">
                                            <div className="relative w-full bg-blue-50 dark:bg-gray-800 rounded-t-md overflow-hidden h-full flex items-end">
                                                <div className="w-full bg-teal-400/80 group-hover:bg-teal-400 transition-all duration-500 rounded-t-md relative" style={{ height: '92%' }}>
                                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded transition-opacity">92%</div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Design</span>
                                        </div>
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
                                            <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                            Filter
                                        </button>
                                        <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-none cursor-pointer">
                                            <span className="material-symbols-outlined text-[18px]">download</span>
                                            Export
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                        <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-700 dark:text-gray-300">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold" scope="col">Rank</th>
                                                <th className="px-6 py-4 font-semibold" scope="col">Candidate</th>
                                                <th className="px-6 py-4 font-semibold" scope="col">Role</th>
                                                <th className="px-6 py-4 font-semibold" scope="col">Score</th>
                                                <th className="px-6 py-4 font-semibold" scope="col">Status</th>
                                                <th className="px-6 py-4 font-semibold text-right" scope="col">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {/* Row 1 */}
                                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 flex items-center justify-center font-bold">1</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img alt="Jane Doe" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU5z_Z8syXWVwgjr2x35OeDQhyxpWb2MQAIA73Amn_6YQs2HZGwGUiUg6FFyGx6rBcecDq8OQwP2hiIEJ7XyqBehOXaaFvSBXl3eHJjJMwjEubKexsSLAY93lj8-r3LbJq5PriAMkBjE6SBV63SBkbxzwQfzUA8878cNqHN5H686s8ni0972cB_hP-_7otXev3IROd46-fwj7XhQEjSBOG50Gf2uRFcReWIVWtW7wb4tpLwAJPMOKZ0do3ZSJdlJgp84cOEYm_iQ" />
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">Jane Doe</div>
                                                            <div className="text-xs text-gray-500">jane.doe@example.com</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">Senior React Dev</td>
                                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">98<span className="text-xs text-gray-400 font-normal">/100</span></td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        Interview Ready
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm bg-transparent border-none cursor-pointer">View Profile</button>
                                                </td>
                                            </tr>
                                            {/* Row 2 */}
                                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center font-bold">2</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img alt="John Smith" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmaR4GBP4eMCPjOf3_Jyzm1VmIOXN-SFYD1f8gkdxh6vq08dk94Inol07kTEe9Yi1ohGZ25CA-kITjgAg2DQLzO-W5WXKq_GZjsBbdSy6BAjYg0Xh2myGFiLZF-6wPfsg-xIhiJuQxBgHG9rUkHSElD56RIRTMKL8h6vAmxVvOtOG2ixyX-eJmdK3_wXOE0tU96VZxxlJrm0vxLTU6-_ncd9phbcaFoFqp69IlXAq_bTyjXe7_d2BVMByXdnB2hV9ZosjIVD1NpQ" />
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">John Smith</div>
                                                            <div className="text-xs text-gray-500">john.smith@example.com</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">Backend Engineer</td>
                                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">94<span className="text-xs text-gray-400 font-normal">/100</span></td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                        Reviewing
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm bg-transparent border-none cursor-pointer">View Profile</button>
                                                </td>
                                            </tr>
                                            {/* Row 3 */}
                                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center font-bold">3</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                     <div className="flex items-center gap-3">
                                                        <img alt="Alice Cooper" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXu3zGqzOp0woETcR9XBfn389zTxSMxxolUSfNwSxpkavqEw0dk04xaj0fnz5REleGirNe_EA18nv62wS7kRWuCkqYvwXAexa-WN-ZIV-qs4DkmL3kqQ0uotIaV_9VkxsZHv1Pubp2uFsSo48U1piAeQd0k45EoYv-rR90OypbwA0zsUY2qCsnlNVYUc44fG0HHFBiMTeG0EgOfU2xponSn2SGBRFBB4wruIbot2DgrqVyLEzgv0YCfOlrUJENwgkMsk3_CYCoxg" />
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">Alice Cooper</div>
                                                            <div className="text-xs text-gray-500">alice.c@example.com</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">Product Designer</td>
                                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">89<span className="text-xs text-gray-400 font-normal">/100</span></td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                        Technical
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm bg-transparent border-none cursor-pointer">View Profile</button>
                                                </td>
                                            </tr>
                                            {/* Row 4 */}
                                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center font-bold">4</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img alt="Marcus Johnson" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSGCxn7rgif8wgQJ30hSDPS8U6P9VbzvSO50_thp94LkM-vwpsDmfoUI7IR4mKsjtd1Enlm2iFPSi2QoVosqWF9XbNcqDOg_bBmudwmgKZn7Zd1JOeE4AhaDI9y-wITOn07XPhBsblBYh0ax3B_guvw7W7pFuzRlV_K4hA5BHxIMTy7fO8JIciSNF1TVgJLS-nYEjzsK8e9Ervt0e8P-Y0fgzKUXhsVvSQzL6ng1y0lLDx2-3EkAuTQKWjInalLRAAJlXEU6XkMA" />
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">Marcus Johnson</div>
                                                            <div className="text-xs text-gray-500">marcus.j@example.com</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">Data Scientist</td>
                                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">88<span className="text-xs text-gray-400 font-normal">/100</span></td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                        Reviewing
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm bg-transparent border-none cursor-pointer">View Profile</button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination */}
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Showing 1-4 of 42 candidates</span>
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
                </div>
            </main>
        </div>
    );
};

export default RecruiterDashboard;
