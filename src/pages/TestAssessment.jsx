import React, { useState, useEffect } from 'react';
import {
    Settings,
    HelpCircle,
    Send,
    Flag,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Bookmark,
    Code,
    Terminal,
    Cpu,
    CheckCircle,
    Menu,
    Clock
} from 'lucide-react';

const TestAssessment = () => {
    const [currentQuestion, setCurrentQuestion] = useState(5);
    const [selectedOption, setSelectedOption] = useState(2); // Mock selecting the 2nd option
    const [timeLeft, setTimeLeft] = useState(2699); // 44:59 in seconds

    // Timer countdown effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const questions = Array.from({ length: 20 }, (_, i) => i + 1);
    const sections = [
        { id: 'aptitude', name: 'Aptitude', count: '10 Questions', icon: HelpCircle, active: false },
        { id: 'technical', name: 'Technical', count: '20 Questions', icon: Cpu, active: true },
        { id: 'coding', name: 'Coding Challenge', count: '2 Problems', icon: Code, active: false },
    ];

    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans flex flex-col h-screen overflow-hidden">

            {/* Top Header */}
            <header className="h-16 bg-[#0F172A] border-b border-slate-700 flex items-center justify-between px-6 shrink-0 z-20 relative shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <Terminal className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg leading-tight">IntelliHire</h1>
                        <p className="text-[10px] text-blue-400 font-semibold tracking-wider">ASSESSMENT ENGINE</p>
                    </div>
                </div>

                {/* Center Progress Bar (Optional, visual flare) */}
                <div className="absolute bottom-0 left-0 h-0.5 bg-blue-600 w-1/3"></div>

                <div className="flex items-center gap-6">
                    <button className="text-slate-400 hover:text-white transition-colors"><Settings className="h-5 w-5" /></button>
                    <button className="text-slate-400 hover:text-white transition-colors"><HelpCircle className="h-5 w-5" /></button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20">
                        Submit Test <Send className="h-4 w-4" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">

                {/* Left Sidebar - Navigation */}
                <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col shrink-0 z-10">
                    <div className="p-6 border-b border-slate-800">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Sections</p>
                        <h2 className="text-white font-bold text-lg">Full Stack Developer Assessment</h2>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${section.active
                                        ? 'bg-blue-600/10 border border-blue-600/50 text-white'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                                    }`}
                            >
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${section.active ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                    <section.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className={`font-semibold text-sm ${section.active ? 'text-blue-400' : ''}`}>{section.name}</p>
                                    <p className="text-xs opacity-60 mt-0.5">{section.count}</p>
                                </div>
                                {section.active && <ChevronRight className="h-4 w-4 ml-auto text-blue-500" />}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm">AM</div>
                            <div>
                                <p className="text-sm font-bold text-white">Alex Morgan</p>
                                <p className="text-xs text-slate-500">ID: #8492</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content - Question Area */}
                <main className="flex-1 overflow-y-auto bg-[#0B1120] relative max-w-5xl mx-auto w-full">
                    <div className="max-w-3xl mx-auto py-10 px-8">

                        {/* Question Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-white">Question 5</h2>
                                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700 font-medium">Single Choice</span>
                                <span className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded border border-green-900/50 font-medium">+2 Marks</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="text-slate-500 hover:text-yellow-500 transition-colors" title="Report Issue"><Flag className="h-5 w-5" /></button>
                                <button className="text-slate-500 hover:text-red-500 transition-colors" title="Report Error"><AlertTriangle className="h-5 w-5" /></button>
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="prose prose-invert max-w-none mb-10">
                            <p className="text-lg text-slate-200 leading-relaxed font-medium">
                                What is the time complexity of a binary search algorithm in the worst-case scenario for a sorted array of size <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 text-sm">n</code>?
                            </p>
                        </div>

                        {/* Options */}
                        <div className="space-y-4 mb-10">
                            {['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'].map((opt, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedOption(idx + 1)}
                                    className={`group flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedOption === idx + 1
                                            ? 'border-blue-500 bg-blue-900/10'
                                            : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800 hover:border-slate-600'
                                        }`}
                                >
                                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedOption === idx + 1
                                            ? 'border-blue-500'
                                            : 'border-slate-500 group-hover:border-slate-400'
                                        }`}>
                                        {selectedOption === idx + 1 && <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>}
                                    </div>
                                    <span className={`text-base font-medium font-mono ${selectedOption === idx + 1 ? 'text-blue-100' : 'text-slate-300'}`}>{opt}</span>
                                </div>
                            ))}
                        </div>

                        {/* Sticky Timer (Centered Floating) */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full px-6 py-2 flex items-center gap-3 shadow-xl">
                                <div className="relative h-6 w-6 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-blue-400" />
                                    <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-spin-slow" style={{ borderTopColor: '#3b82f6' }}></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none mb-0.5">Time Remaining</span>
                                    <span className="text-lg font-mono font-bold text-white leading-none">{formatTime(timeLeft)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Navigation */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                            <button className="px-6 py-3 rounded-lg border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
                                <ChevronLeft className="h-4 w-4" /> Previous
                            </button>

                            <div className="flex gap-4">
                                <button className="px-6 py-3 rounded-lg border border-yellow-600/30 text-yellow-500 font-semibold hover:bg-yellow-900/10 transition-colors flex items-center gap-2">
                                    <Bookmark className="h-4 w-4 fill-current" /> Mark for Review
                                </button>
                                <button className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/40 flex items-center gap-2">
                                    Next Question <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Scratchpad (Optional per design, but visible at bottom) */}
                        <div className="mt-12 p-6 rounded-xl border border-slate-800 border-dashed bg-slate-900/50">
                            <div className="flex items-center gap-2 mb-4 text-slate-500 text-xs font-bold tracking-widest uppercase">
                                <Code className="h-4 w-4" /> Scratchpad / Quick Notes
                            </div>
                            <textarea
                                className="w-full h-32 bg-transparent text-slate-400 font-mono text-sm focus:outline-none resize-none placeholder:text-slate-700"
                                placeholder="// You can use this space for rough calculations or psuedocode..."
                            ></textarea>
                        </div>

                    </div>
                </main>

                {/* Right Sidebar - Question Palette */}
                <aside className="w-80 bg-[#0F172A] border-l border-slate-800 flex flex-col shrink-0 z-10">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-white">Question Palette</h3>
                        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded font-mono">5/20</span>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-4 gap-3 mb-8">
                            {questions.map((q) => {
                                let statusColor = "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500"; // default
                                if (q === 5) statusColor = "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/50 ring-2 ring-blue-500/20"; // current
                                else if ([1, 2, 3, 4].includes(q)) statusColor = "bg-blue-500 text-white border-blue-400"; // answered
                                else if (q === 9) statusColor = "bg-yellow-900/30 text-yellow-500 border-yellow-600/50 relative"; // flagged

                                return (
                                    <button
                                        key={q}
                                        className={`h-12 w-12 rounded-lg border font-semibold text-sm flex items-center justify-center transition-all ${statusColor}`}
                                    >
                                        {q}
                                        {q === 9 && <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-yellow-500"></div>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                <span className="text-xs text-slate-400">Answered</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-600 border border-blue-400"></div>
                                <span className="text-xs text-slate-400">Current</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                <span className="text-xs text-slate-400">Flagged</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-slate-700"></div>
                                <span className="text-xs text-slate-400">Not Visited</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-800 mt-auto bg-slate-900/50">
                        <button className="w-full py-3 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2">
                            <HelpCircle className="h-4 w-4" /> View Instructions
                        </button>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default TestAssessment;
