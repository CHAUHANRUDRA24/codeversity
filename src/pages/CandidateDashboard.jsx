import React from 'react';
import {
    Bell,
    Briefcase,
    CheckCircle,
    Clock,
    FileText,
    HelpCircle,
    Layout,
    Lock,
    MoreHorizontal,
    Play,
    User,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CandidateDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem('userRole');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Navbar */}
            <nav className="sticky top-0 z-30 w-full bg-white border-b border-slate-200">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">IntelliHire</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#" className="text-sm font-medium text-blue-600">Dashboard</a>
                        <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900">My Profile</a>
                        <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900">Applications</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="text-slate-400 hover:text-slate-600">
                            <Bell className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-900">Alex Morgan</p>
                                <p className="text-xs text-slate-500">Candidate ID: #8492</p>
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                alt="Profile"
                                className="h-10 w-10 rounded-full bg-slate-200 object-cover ring-2 ring-white"
                            />
                            <button
                                onClick={handleLogout}
                                className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                                title="Sign out"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Main Content */}
                    <div className="flex-1">

                        {/* Welcome Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                Welcome back, Alex <span className="text-2xl">👋</span>
                            </h1>
                            <p className="mt-1 text-slate-600">
                                You have <span className="font-semibold text-slate-900">3 pending assessments</span> to complete for your <span className="font-semibold text-blue-600">Senior Frontend Developer</span> application.
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">3</p>
                                    <p className="text-sm text-slate-500">Tests Pending</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">1</p>
                                    <p className="text-sm text-slate-500">Completed</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">~45m</p>
                                    <p className="text-sm text-slate-500">Est. Time Left</p>
                                </div>
                            </div>
                        </div>

                        {/* Available Tests */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-6 w-6 text-blue-600">
                                    <Briefcase className="h-6 w-6" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Available Tests</h2>
                            </div>

                            <div className="space-y-4">
                                {/* Test Card 1 */}
                                <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row">
                                    <div className="sm:w-48 h-48 sm:h-auto bg-slate-800 relative overflow-hidden">
                                        <img
                                            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400"
                                            alt="Coding"
                                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-bold text-slate-900">Frontend Fundamentals</h3>
                                                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded">Easy</span>
                                            </div>
                                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                                Assess your knowledge of HTML5 semantic tags, CSS box model, and basic JavaScript ES6+ features.
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 30 Mins</span>
                                                <span className="flex items-center gap-1"><Layout className="h-3.5 w-3.5" /> 25 Questions</span>
                                            </div>
                                            <a href="/assessment" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                                                Start Test <Play className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Test Card 2 */}
                                <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row">
                                    <div className="sm:w-48 h-48 sm:h-auto bg-slate-800 relative overflow-hidden">
                                        <img
                                            src="https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&q=80&w=400"
                                            alt="Server"
                                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-bold text-slate-900">System Design Logic</h3>
                                                <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-0.5 rounded">Hard</span>
                                            </div>
                                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                                Design scalable distributed systems. Focus on load balancing, database sharding, and caching strategies.
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 60 Mins</span>
                                                <span className="flex items-center gap-1"><Layout className="h-3.5 w-3.5" /> 5 Scenarios</span>
                                            </div>
                                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                                                Start Test <Play className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Test Card 3 */}
                                <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row">
                                    <div className="sm:w-48 h-48 sm:h-auto bg-slate-800 relative overflow-hidden">
                                        <img
                                            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400"
                                            alt="Meeting"
                                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-bold text-slate-900">Behavioral Assessment</h3>
                                                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">Medium</span>
                                            </div>
                                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                                Situational judgment tests to evaluate problem-solving approaches, teamwork, and communication skills.
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 15 Mins</span>
                                                <span className="flex items-center gap-1"><Layout className="h-3.5 w-3.5" /> 10 Questions</span>
                                            </div>
                                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                                                Start Test <Play className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="w-full lg:w-80 flex flex-col gap-6">

                        {/* Application Status */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Application Status</h3>
                            <div className="relative">
                                {/* Connector Line */}
                                <div className="absolute top-2 bottom-0 left-2.5 w-0.5 bg-slate-100"></div>

                                <div className="space-y-8 relative">
                                    {/* Step 1: Completed */}
                                    <div className="flex gap-4">
                                        <div className="relative z-10 flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center ring-4 ring-white">
                                            <CheckCircle className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Resume Screening</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Completed on Oct 24</p>
                                        </div>
                                    </div>

                                    {/* Step 2: Active */}
                                    <div className="flex gap-4">
                                        <div className="relative z-10 flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center ring-4 ring-blue-50">
                                            <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                                        </div>
                                        <div className="w-full">
                                            <p className="text-sm font-bold text-blue-600">Skills Assessment</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Action Required</p>
                                            {/* Progress Bar */}
                                            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                                            </div>
                                            <p className="text-[10px] text-right text-slate-400 mt-1">1/4 Complete</p>
                                        </div>
                                    </div>

                                    {/* Step 3: Pending */}
                                    <div className="flex gap-4">
                                        <div className="relative z-10 flex-shrink-0 h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center ring-4 ring-white border border-slate-200">
                                            <Lock className="h-3 w-3 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500">Technical Interview</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Pending Results</p>
                                        </div>
                                    </div>

                                    {/* Step 4: Locked */}
                                    <div className="flex gap-4">
                                        <div className="relative z-10 flex-shrink-0 h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center ring-4 ring-white border border-slate-200">
                                            <Lock className="h-3 w-3 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500">HR Round</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Locked</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Help Section */}
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                            <div className="flex gap-3 mb-2">
                                <HelpCircle className="h-5 w-5 text-blue-600" />
                                <h4 className="font-bold text-slate-900">Need Assistance?</h4>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                Having trouble with a test or need accommodation?
                            </p>
                            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                                Contact Support
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default CandidateDashboard;
