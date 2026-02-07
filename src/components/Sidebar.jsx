import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ role = 'recruiter', user, onLogout, sidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname + location.search;

    const recruiterLinks = [
        { label: 'Dashboard', icon: 'dashboard', path: '/recruiter-dashboard' },
        { label: 'Create Job', icon: 'work', path: '/create-job' },
    ];

    const candidateLinks = [
        { label: 'Dashboard', icon: 'dashboard', path: '/candidate-dashboard' },
        { label: 'My Applications', icon: 'assignment', path: '/candidate-dashboard?tab=applications' },
        { label: 'Assessments', icon: 'quiz', path: '/candidate-dashboard?tab=assessments' },
    ];

    const links = role === 'recruiter' ? recruiterLinks : candidateLinks;

    const activeClass = "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-600/20";
    const inactiveClass = "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800";

    return (
        <aside className={`w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-colors duration-200 ${sidebarOpen ? 'flex' : 'hidden'} md:flex h-screen sticky top-0`}>
            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col px-2 py-2">
                    <div className="flex items-center justify-between">
                        <h1 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">IntelliHire</h1>
                        {/* Close button for mobile */}
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium capitalize">{role} Portal</p>
                </div>
                <nav className="flex flex-col gap-1">
                    {links.map((link) => {
                        const isActive = currentPath === link.path || (!link.path.includes('?') && !currentPath.includes('?') && currentPath.startsWith(link.path));
                        return (
                            <button
                                key={link.path}
                                onClick={() => navigate(link.path)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group w-full text-left ${isActive ? activeClass : inactiveClass}`}
                            >
                                <span className={`material-symbols-outlined text-[24px] ${isActive ? 'fill-1' : ''} group-hover:text-indigo-600 transition-colors`}>{link.icon}</span>
                                <span className="text-sm font-medium">{link.label}</span>
                            </button>
                        );
                    })}

                    <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 dark:hover:text-amber-500 group w-full text-left mt-auto">
                        <span className="material-symbols-outlined text-[24px] group-hover:text-amber-600 transition-colors">logout</span>
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </nav>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-slate-800">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.email || 'Unknown User'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
