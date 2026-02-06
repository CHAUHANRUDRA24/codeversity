import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Home } from 'lucide-react';

const ResultPage = () => {
    const { jobId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // State from navigation if available immediately
    const [result, setResult] = useState(location.state || null);
    const [loading, setLoading] = useState(!location.state);

    useEffect(() => {
        const fetchResult = async () => {
            if (result) return; // already have data
            if (!user) return;

            try {
                const q = query(
                    collection(db, "results"),
                    where("userId", "==", user.uid),
                    where("jobId", "==", jobId)
                );
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const results = querySnapshot.docs.map(doc => doc.data());
                    // Sort by submittedAt descending
                    results.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
                    setResult(results[0]);
                } else {
                    // No result found, redirect?
                    console.log("No result found");
                }
            } catch (error) {
                console.error("Error fetching result:", error);
            }
            setLoading(false);
        };

        fetchResult();
    }, [jobId, user, result]);

    if (loading) return <div className="text-center p-8">Loading result...</div>;
    if (!result) return <div className="text-center p-8">No result found.</div>;

    const isPass = result.percentage >= 60;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center p-8">
                <div className={`mb-6 mx-auto w-24 h-24 rounded-full flex items-center justify-center ${isPass ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isPass ? 
                        <CheckCircle className="w-12 h-12 text-green-600" /> : 
                        <XCircle className="w-12 h-12 text-red-600" />
                    }
                </div>
                
                <h1 className={`text-3xl font-bold mb-2 ${isPass ? 'text-green-700' : 'text-red-700'}`}>
                    {isPass ? 'Congratulations!' : 'Assessment Failed'}
                </h1>
                <p className="text-gray-600 mb-8">
                    {isPass ? 'You have successfully passed the assessment.' : 'Unfortunately, you did not meet the passing criteria.'}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Score</p>
                        <p className="text-2xl font-bold text-gray-900">{result.score} / {result.total}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Percentage</p>
                        <p className="text-2xl font-bold text-gray-900">{result.percentage.toFixed(1)}%</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={() => navigate('/candidate-dashboard')}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors border-none cursor-pointer"
                    >
                        <Home className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultPage;
