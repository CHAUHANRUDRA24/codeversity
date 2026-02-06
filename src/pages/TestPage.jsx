import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const TestPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [job, setJob] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) return;
            const jobRef = doc(db, "jobs", jobId);
            const jobSnap = await getDoc(jobRef);
            if (jobSnap.exists()) {
                setJob({ id: jobSnap.id, ...jobSnap.data() });
            } else {
                console.error("Job not found");
                navigate('/candidate-dashboard'); // Redirect if invalid
            }
            setLoading(false);
        };
        fetchJob();
    }, [jobId]);

    const handleAnswerChange = (questionId, selectedOption) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    const handleSubmit = async () => {
        if (!job) return;
        setSubmitting(true);

        let score = 0;
        const total = job.questions.length;

        job.questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                score++;
            }
        });

        const percentage = (score / total) * 100;
        
        try {
            // Save result to Firestore
            await addDoc(collection(db, "results"), {
                userId: user.uid,
                jobId: jobId,
                score: score,
                total: total,
                percentage: percentage,
                submittedAt: new Date().toISOString()
            });

            // Redirect to result page
            navigate(`/result/${jobId}`, { state: { score, total, percentage } });
        } catch (error) {
            console.error("Error submitting test:", error);
            alert("Failed to submit test. Please try again.");
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading assessment...</div>;
    if (!job) return <div className="p-8 text-center">Job not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">{job.title} Assessment</h2>
                        <p className="mt-1 text-sm text-gray-500">Answer all questions carefully.</p>
                    </div>
                    <div className="p-6 space-y-8">
                        {job.questions.map((q, index) => (
                            <div key={q.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="font-medium text-gray-900 mb-4">
                                    <span className="text-blue-600 mr-2">Q{index + 1}.</span>
                                    {q.question}
                                </p>
                                <div className="space-y-3">
                                    {q.options.map((option) => (
                                        <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name={`question-${q.id}`}
                                                value={option}
                                                checked={answers[q.id] === option}
                                                onChange={() => handleAnswerChange(q.id, option)}
                                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700 group-hover:text-gray-900">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || Object.keys(answers).length < job.questions.length}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? 'Submitting...' : 'Submit Assessment'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestPage;
