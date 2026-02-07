
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA66J04MAuWDVDqPHa4OHlEo41h0Bvmxng",
    authDomain: "codeversity-bfb92.firebaseapp.com",
    projectId: "codeversity-bfb92",
    storageBucket: "codeversity-bfb92.firebasestorage.app",
    messagingSenderId: "389071474550",
    appId: "1:389071474550:web:c3717973b62caad93d7457",
    measurementId: "G-3XXPZ18XV6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const clearResults = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "results"));
        console.log(`Found ${querySnapshot.size} results. Deleting...`);

        const deletePromises = querySnapshot.docs.map(document =>
            deleteDoc(doc(db, "results", document.id))
        );

        await Promise.all(deletePromises);
        console.log("All candidate quiz data deleted successfully.");
    } catch (error) {
        console.error("Error deleting documents: ", error);
    }
};

clearResults();
