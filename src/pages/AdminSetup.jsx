import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { demoUsers } from '../data/demoUsers';
import { Link } from 'react-router-dom';

const AdminSetup = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const addLog = (msg) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const initializeAccounts = async () => {
        setLoading(true);
        setLogs([]);
        addLog("Starting batch account creation...");
        
        const allUsers = [...demoUsers.recruiters, ...demoUsers.candidates];
        
        // We must process sequentially to avoid auth conflicts
        for (const user of allUsers) {
            try {
                addLog(`Processing ${user.name} (${user.email})...`);
                
                // 1. Check if we can login (exists)
                try {
                    await signInWithEmailAndPassword(auth, user.email, user.password);
                    addLog(`-> User exists in Auth.`);
                } catch (authErr) {
                    if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
                        addLog(`-> Creating new user in Auth...`);
                        await createUserWithEmailAndPassword(auth, user.email, user.password);
                    } else {
                        throw authErr;
                    }
                }

                // 2. Ensure Firestore Profile
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const docRef = doc(db, "users", currentUser.uid);
                    await setDoc(docRef, {
                        ...user, // saves name, role, etc.
                        createdAt: new Date().toISOString(),
                        isVerified: true
                    }, { merge: true }); // Merge to avoid overwriting existing data if any
                    addLog(`-> Firestore profile updated.`);
                }

                // 3. Sign out to prepare for next
                await signOut(auth);

            } catch (err) {
                console.error(err);
                addLog(`ERROR with ${user.email}: ${err.message}`);
            }
        }

        addLog("Batch operation complete!");
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8 font-mono">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-white">Admin Setup: Batch Account Creator</h1>
                    <Link to="/login" className="text-blue-400 hover:text-blue-300">Back to Login</Link>
                </div>
                
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl mb-8">
                    <p className="mb-4 text-slate-400">
                        This script will iterate through 10 defined demo users (5 Recruiters, 5 Candidates).
                        For each, it will ensure Authentication exists and write the profile to Firestore.
                    </p>
                    <button 
                        onClick={initializeAccounts}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? <span className="animate-spin">⚙️</span> : '🚀'}
                        {loading ? 'Processing...' : 'Initialize All 10 Accounts'}
                    </button>
                </div>

                <div className="bg-black/50 p-4 rounded-xl border border-slate-800 h-96 overflow-y-auto font-mono text-sm">
                    {logs.length === 0 ? (
                        <span className="text-slate-600 italic">Waiting to start...</span>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="border-b border-white/5 py-1 last:border-0">
                                {log}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSetup;
