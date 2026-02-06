import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Signup function
  const signup = async (email, password, role) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        role: role,
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // Fetch user role from Firestore
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({ ...currentUser, ...userData }); // Merge auth user with firestore data
          } else {
            // Fallback if doc doesn't exist
            setUser(currentUser);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth State Check Error:", error);
        // Even if firestore fails, we should let the user be "logged in" with just auth data or null
        // But preventing 'loading' stuck is priority
        setUser(null); // safe fallback
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, loading }}>
        {!loading && children}
    </AuthContext.Provider>
  );
};
