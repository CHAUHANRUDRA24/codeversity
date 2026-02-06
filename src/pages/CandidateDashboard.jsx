import React from 'react';
import { LogOut, Home, Code, Award, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CandidateDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-indigo-600">IntelliHire</h1>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">Candidate</span>
        </div>
        <div className="flex items-center gap-6">
           <a href="#" className="text-indigo-600 font-medium flex items-center gap-2"><Home size={18}/> Home</a>
           <a href="#" className="text-gray-500 hover:text-gray-900 flex items-center gap-2"><Code size={18}/> Assessments</a>
           <a href="#" className="text-gray-500 hover:text-gray-900 flex items-center gap-2"><Award size={18}/> My Impact</a>
           <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">C</div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-8">
        <div className="mb-8">
           <h2 className="text-2xl font-bold text-gray-800">Ready to prove your skills?</h2>
           <p className="text-gray-500">Complete assessments to rank higher for top jobs.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
           {/* Card 1 */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Code size={24} />
                 </div>
                 <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">New</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Python & Data Structures</h3>
              <p className="text-sm text-gray-500 mb-4">45 min • 3 Coding Challenges</p>
              <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Start Assessment</button>
           </div>
           
           {/* Card 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer opacity-75">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Award size={24} />
                 </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">System Design Basics</h3>
              <p className="text-sm text-gray-500 mb-4">30 min • Multiple Choice</p>
              <button className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">View Details</button>
           </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;
