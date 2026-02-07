import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateQuestions } from '../utils/generateQuestions';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Save, CheckCircle, BrainCircuit, Code, FileText, CheckSquare } from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Assuming global auth

  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid Level');
  
  // State for the structured questions from generator
  const [generatedSections, setGeneratedSections] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // AI Handler
  const handleGenerateValues = () => {
    if (!jobTitle || !jobDescription) {
        alert("Please fill in Job Title and Description first.");
        return;
    }

    setIsGenerating(true);
    setGeneratedSections(null);
    
    // Simulate AI thinking time for UX
    setTimeout(() => {
        const sections = generateQuestions(jobDescription, jobTitle);
        setGeneratedSections(sections);
        setIsGenerating(false);
    }, 1500);
  };

  const handlePublish = async () => {
    if (!generatedSections) return;
    
    setIsPublishing(true);
    try {
      if (auth.currentUser) {
          // Flatten questions for Firestore with types & IDs
          const finalQuestions = [
              ...generatedSections.mcqs.map(q => ({ ...q, type: 'mcq', id: Math.random().toString(36).substr(2, 9) })),
              ...generatedSections.subjective.map(q => ({ question: q, type: 'subjective', id: Math.random().toString(36).substr(2, 9) })),
              ...generatedSections.coding.map(q => ({ ...q, type: 'coding', id: Math.random().toString(36).substr(2, 9) }))
          ];

          await addDoc(collection(db, "jobs"), {
            title: jobTitle,
            description: jobDescription,
            experienceLevel,
            questions: finalQuestions,
            createdBy: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            status: 'active'
          });
          navigate('/recruiter-dashboard');
      } else {
        alert("User not authenticated");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to publish job. See console.");
    }
    setIsPublishing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar (Simple for context) */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="font-bold text-xl text-gray-900">IntelliHire</span>
          </div>
          
          <nav className="space-y-1">
             <button onClick={() => navigate('/recruiter-dashboard')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                Dashboard
             </button>
             <div className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                Create Assessment
             </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Assessment</h1>
                <p className="text-sm text-gray-500 mt-1">Define the role to let our AI assist with screening.</p>
            </div>
            <div className="flex gap-3">
                 <button onClick={() => navigate('/recruiter-dashboard')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                 </button>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left: Input Form */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                            <input 
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="e.g. Senior Frontend Engineer"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                            <select 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value)}
                            >
                                <option>Fresher (0-2 years)</option>
                                <option>Mid Level (2-5 years)</option>
                                <option>Senior Level (5+ years)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                            <textarea 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-40 text-sm"
                                placeholder="Paste the job description here. We will analyze keywords like 'React', 'Python', etc."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <p className="text-xs text-gray-400 mt-2 text-right">{jobDescription.length} chars</p>
                        </div>

                        <button 
                            onClick={handleGenerateValues}
                            disabled={isGenerating || !jobTitle || !jobDescription}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Analyzing Skills...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    Generate AI Assessment
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Preview & Publish */}
            <div className="space-y-6">
                 {/* Empty State */}
                 {!generatedSections && !isGenerating && (
                     <div className="h-full min-h-[400px] bg-white border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 text-center text-gray-500">
                         <BrainCircuit size={48} className="mb-4 text-gray-300" />
                         <h3 className="text-lg font-medium text-gray-900">AI Preview Area</h3>
                         <p className="max-w-xs mt-2 text-sm">Fill out the job details and click Generate to see the AI-curated screening questions previewed here.</p>
                     </div>
                 )}

                 {isGenerating && (
                     <div className="h-full min-h-[400px] bg-white border border-gray-100 rounded-xl flex flex-col items-center justify-center p-8 text-center">
                         <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                         <h3 className="text-lg font-medium text-gray-900">Generating Questions</h3>
                         <p className="text-sm text-gray-500">Scanning keywords and formatting schema...</p>
                         <div className="flex gap-2 mt-4 text-xs text-indigo-400">
                            <span>MCQ</span> • <span>Subjective</span> • <span>Coding</span>
                         </div>
                     </div>
                 )}

                 {/* Questions List */}
                 {generatedSections && !isGenerating && (
                     <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 flex flex-col max-h-[calc(100vh-140px)]">
                        <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center flex-shrink-0">
                            <div>
                                <h3 className="font-semibold text-indigo-900">Assessment Preview</h3>
                                <p className="text-xs text-indigo-600">3 Sections Generated</p>
                            </div>
                            <span className="bg-white text-indigo-700 px-2 py-1 rounded text-xs font-bold shadow-sm">
                                {generatedSections.mcqs.length + generatedSections.subjective.length + generatedSections.coding.length} Qs
                            </span>
                        </div>
                        
                        <div className="divide-y divide-gray-100 overflow-y-auto p-0">
                            
                            {/* MCQs Section */}
                            {generatedSections.mcqs.length > 0 && (
                                <div className="p-4 bg-slate-50 border-b border-slate-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckSquare size={16} className="text-blue-600" />
                                        <h4 className="text-xs font-bold text-slate-500 uppercase">Multiple Choice ({generatedSections.mcqs.length})</h4>
                                    </div>
                                    <div className="space-y-4">
                                        {generatedSections.mcqs.map((q, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                                <p className="text-sm font-medium text-slate-800 mb-2">{q.question}</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {q.options.map((opt, i) => (
                                                        <div key={i} className="text-xs px-2 py-1 rounded bg-slate-50 text-slate-600 border border-slate-100 truncate">
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subjective Section */}
                            {generatedSections.subjective.length > 0 && (
                                <div className="p-4 bg-slate-50 border-b border-slate-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText size={16} className="text-amber-600" />
                                        <h4 className="text-xs font-bold text-slate-500 uppercase">Subjective ({generatedSections.subjective.length})</h4>
                                    </div>
                                    <div className="space-y-4">
                                        {generatedSections.subjective.map((q, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                                <p className="text-sm font-medium text-slate-800">{q}</p>
                                                <div className="mt-2 h-16 bg-slate-50 rounded border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                                                    Candidate will type answer here...
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Coding Section */}
                            {generatedSections.coding.length > 0 && (
                                <div className="p-4 bg-slate-50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Code size={16} className="text-purple-600" />
                                        <h4 className="text-xs font-bold text-slate-500 uppercase">Coding Challenge ({generatedSections.coding.length})</h4>
                                    </div>
                                    <div className="space-y-4">
                                        {generatedSections.coding.map((q, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-sm font-bold text-slate-900">{q.title}</p>
                                                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Hard</span>
                                                </div>
                                                <p className="text-xs text-slate-600 mb-2">{q.description}</p>
                                                <pre className="text-[10px] bg-slate-900 text-slate-50 p-2 rounded font-mono overflow-x-auto">
                                                    {q.starterCode}
                                                </pre>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                            <button 
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                {isPublishing ? 'Publishing...' : (
                                    <>
                                        <CheckCircle size={20} />
                                        Publish Live Assessment
                                    </>
                                )}
                            </button>
                        </div>
                     </div>
                 )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default CreateJob;
