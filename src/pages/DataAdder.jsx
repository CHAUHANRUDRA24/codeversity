import React, { useState } from 'react';
import { 
    collection, 
    getDocs, 
    writeBatch, 
    doc, 
    addDoc, 
    deleteDoc,
    query,
    where,
    updateDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Trash2, Plus, Database, RefreshCw, AlertTriangle, CheckCircle, User } from 'lucide-react';

const DataAdder = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const collectionsToClear = ['jobs', 'resumes', 'results'];

    const clearAllData = async () => {
        setLoading(true);
        setStatus({ type: 'info', message: 'Wiping collections...' });
        try {
            const batch = writeBatch(db);

            // 1. Wipe collections
            for (const collName of collectionsToClear) {
                const snapshot = await getDocs(collection(db, collName));
                snapshot.docs.forEach((docSnap) => {
                    batch.delete(docSnap.ref);
                });
            }

            // 2. Reset profile data for ALL users
            const userSnapshot = await getDocs(collection(db, 'users'));
            userSnapshot.docs.forEach((userDoc) => {
                batch.update(userDoc.ref, {
                    aiAnalysis: null,
                    aiMatches: null,
                    resumeUrl: null,
                    resumeName: null,
                    currentResumeId: null,
                    resumeText: null,
                    resumeUpdatedAt: null
                });
            });

            await batch.commit();
            setStatus({ type: 'success', message: 'Full ecosystem reset complete. All candidate attempts, jobs, and analysis data wiped.' });
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Error clearing data: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const addFakeJobs = async () => {
        setLoading(true);
        setStatus({ type: 'info', message: 'Seeding fake jobs...' });
        try {
            const fakeJobs = [
                {
                    title: "Senior Full Stack Engineer",
                    company: "TechNexus AI",
                    location: "San Francisco, CA (Remote)",
                    type: "Full-time",
                    salary: "$160k - $200k",
                    description: "Looking for an expert in React, Node.js, and AI integration. You will lead our generative AI product pod.",
                    requirements: ["5+ years experience", "Expert in React & Node", "Experience with LLMs (OpenAI/Groq)", "Cloud Architecture (AWS/Firebase)"],
                    status: "open",
                    createdAt: new Date().toISOString(),
                    questions: [
                         { id: "q1", type: "mcq", question: "Which hook is best for complex state logic?", options: ["useState", "useEffect", "useReducer", "useRef"] },
                         { id: "q2", type: "coding", title: "Two Sum", description: "Find indices of two numbers that add up to target.", starterCode: "function twoSum(nums, target) {\n  \n}" }
                    ]
                },
                {
                    title: "Frontend Developer (UI/UX Focused)",
                    company: "CreativeStream",
                    location: "New York, NY",
                    type: "Full-time",
                    salary: "$110k - $140k",
                    description: "Join our design-first team to build beautiful, fluid user interfaces. We value micro-interactions and glassmorphism.",
                    requirements: ["3+ years experience", "Expert in Tailwind CSS & Framer Motion", "Deep understanding of React state management", "Portfolio with modern aesthetics"],
                    status: "open",
                    createdAt: new Date().toISOString(),
                    questions: [
                         { id: "q1", type: "mcq", question: "What property handles element stacking?", options: ["z-index", "display", "position", "float"] },
                         { id: "q2", type: "subjective", question: "Explain your process for responsive design." }
                    ]
                },
                {
                    title: "Backend Specialist (Distributed Systems)",
                    company: "DataFlow Systems",
                    location: "Austin, TX (Hybrid)",
                    type: "Full-time",
                    salary: "$140k - $180k",
                    description: "Work on scaling out our data processing pipelines using Go and Rust. Focus on low-latency and high throughput.",
                    requirements: ["Go or Rust expertise", "PostgreSQL & Redis performance tuning", "Docker & Kubernetes", "Event-driven architecture experience"],
                    status: "open",
                    createdAt: new Date().toISOString(),
                    questions: [
                        { id: "q1", type: "mcq", question: "Which protocol is best for real-time data?", options: ["HTTP/1.1", "WebSockets", "SMTP", "FTP"] },
                        { id: "q2", type: "coding", title: "Rate Limiter", description: "Implement a simple token bucket algorithm.", starterCode: "class RateLimiter {\n  \n}" }
                    ]
                },
                {
                    title: "Junior QA Automation Engineer",
                    company: "StableSoft",
                    location: "Remote",
                    type: "Contract",
                    salary: "$40 - $60 / hr",
                    description: "Help us automate our regression testing suites using Playwright and Cypress. Great for early career engineers.",
                    requirements: ["JavaScript basics", "Experience with Playwright or Cypress", "Detail oriented", "Basic understanding of CI/CD"],
                    status: "open",
                    createdAt: new Date().toISOString(),
                    questions: [
                        { id: "q1", type: "mcq", question: "What is a 'flaky' test?", options: ["A test that fails randomly", "A slow test", "A unit test", "A manual test"] },
                        { id: "q2", type: "subjective", question: "How do you handle testing dynamic content?" }
                    ]
                },
                {
                    title: "AI Product Manager",
                    company: "SynthMind",
                    location: "Seattle, WA",
                    type: "Full-time",
                    salary: "$150k - $190k",
                    description: "Lead the roadmap for our core LLM orchestration platform. You will bridge the gap between AI researchers and end-users.",
                    requirements: ["3+ years in Product Management", "Technical background in AI/ML", "Strong stakeholder management", "Data-driven decision making"],
                    status: "open",
                    createdAt: new Date().toISOString(),
                    questions: [
                        { id: "q1", type: "subjective", question: "Define a success metric for a Chatbot." },
                        { id: "q2", type: "mcq", question: "What is RAG?", options: ["Retrieval-Augmented Generation", "Random AI Generation", "Rapid API Gateway", "None"] }
                    ]
                },
                {
                    title: "DevOps Engineer",
                    company: "CloudScale Inc.",
                    location: "Remote",
                    type: "Full-time",
                    salary: "$130k - $160k",
                    description: "Maintain and improve our CI/CD pipelines and cloud infrastructure. Ensure 99.99% uptime.",
                    requirements: ["AWS Certified", "Terraform & Ansible", "Kubernetes mastery", "Python/Bash scripting"],
                    status: "open",
                    createdAt: new Date().toISOString(),
                    questions: [
                        { id: "q1", type: "mcq", question: "What does kubectl apply do?", options: ["Creates/Updates resources", "Deletes pod", "Lists nodes", "Logs in"] },
                        { id: "q2", type: "coding", title: "Bash Script", description: "Write a script to check disk usage.", starterCode: "#!/bin/bash\n" }
                    ]
                },
                {
                    title: "Lead Mobile Developer",
                    company: "Appify",
                    location: "Los Angeles, CA",
                    type: "Full-time",
                    salary: "$140k - $180k",
                    description: "Build high-performance cross-platform mobile apps using Flutter. Lead a team of 3 junior developers.",
                    requirements: ["Expert in Flutter/Dart", "Native iOS/Android knowledge", "State management (Bloc/Provider)", "App Store deployment experience"],
                    status: "open",
                    createdAt: new Date().toISOString(),
                    questions: [
                        { id: "q1", type: "mcq", question: "Which is a Flutter layout widget?", options: ["Column", "Div", "Section", "Span"] },
                        { id: "q2", type: "coding", title: "Flutter Widget", description: "Create a stateful counter widget.", starterCode: "class Counter extends StatefulWidget {\n  \n}" }
                    ]
                },
                 {
                    title: "Cyber Security Analyst",
                    company: "SecureNet",
                    location: "Washington, DC",
                    type: "Full-time",
                    salary: "$120k - $150k",
                    description: "Monitor and defend our network infrastructure. Perform penetration testing and vulnerability assessments.",
                    requirements: ["CISSP or CEH certification", "Experience with SIEM tools", "Network security protocols", "Incident response experience"],
                    status: "open",
                    createdAt: new Date().toISOString(),
                    questions: [
                        { id: "q1", type: "mcq", question: "What is XSS?", options: ["Cross Site Scripting", "Cross Site Styling", "XML Style Sheet", "None"] },
                        { id: "q2", type: "subjective", question: "How would you handle a DDoS attack?" }
                    ]
                },
                {
                    title: "Principal Data Scientist",
                    company: "InsightAlpha",
                    location: "Boston, MA",
                    type: "Full-time",
                    salary: "$180k - $240k",
                    description: "Develop predictive models for financial markets. Work with massive datasets to find hidden alpha.",
                    requirements: ["PhD/Masters in Math/Stats/CS", "Expert in Python (Pandas, Scikit-learn, PyTorch)", "Time-series analysis", "Big Data tools (Spark/Hadoop)"],
                    status: "open",
                    createdAt: new Date().toISOString(),
                    questions: [
                        { id: "q1", type: "mcq", question: "Which algorithm is suitable for classification?", options: ["Linear Regression", "K-Means", "Logistic Regression", "PCA"] },
                        { id: "q2", type: "coding", title: "Data Cleaning", description: "Write a function to fill NaN values with mean.", starterCode: "def clean_data(df):\n  \n" }
                    ]
                }
            ];

            for (const job of fakeJobs) {
                await addDoc(collection(db, 'jobs'), job);
            }

            setStatus({ type: 'success', message: 'Fake jobs added successfully!' });
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Error adding fake jobs: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const addFakeApplications = async () => {
        if (!auth.currentUser) {
            setStatus({ type: 'error', message: 'You must be logged in to seed applications.' });
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', message: 'Generating fake candidate performance data...' });
        try {
            const jobsSnapshot = await getDocs(collection(db, 'jobs'));
            const jobIds = jobsSnapshot.docs.map(d => d.id);

            if (jobIds.length === 0) {
                throw new Error("No jobs found. Seed jobs first!");
            }

            const fakeResults = jobIds.flatMap(jobId => [
                {
                    userId: auth.currentUser.uid,
                    jobId: jobId,
                    percentage: 85 + Math.random() * 10,
                    submittedAt: new Date().toISOString(),
                    tabSwitchViolation: false,
                    aiEvaluation: {
                        credibilityScore: 92,
                        technicalSummary: "Strong understanding of core concepts."
                    }
                },
                {
                    userId: "dummy_user_1",
                    jobId: jobId,
                    percentage: 45 + Math.random() * 20,
                    submittedAt: new Date().toISOString(),
                    tabSwitchViolation: true,
                    aiEvaluation: {
                        credibilityScore: 30,
                        technicalSummary: "Inconsistent performance and suspicious tab activity."
                    }
                }
            ]);

            for (const res of fakeResults) {
                await addDoc(collection(db, 'results'), res);
            }

            setStatus({ type: 'success', message: 'Fake applications seeded for all active tracks!' });
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Error: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const wipeApplicationsOnly = async () => {
        setLoading(true);
        setStatus({ type: 'info', message: 'Deleting only application results...' });
        try {
            const batch = writeBatch(db);
            const snapshot = await getDocs(collection(db, 'results'));
            let count = 0;
            snapshot.docs.forEach((docSnap) => {
                batch.delete(docSnap.ref);
                count++;
            });
            await batch.commit();
            setStatus({ type: 'success', message: `Cleared ${count} application records.` });
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Error wiping applications: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const [csvFile, setCsvFile] = useState(null);

    const handleCsvUpload = async () => {
        if (!csvFile || !auth.currentUser) {
            setStatus({ type: 'error', message: 'Please select a CSV file and ensure you are logged in.' });
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', message: 'Parsing CSV and seeding applications...' });

        try {
            const text = await csvFile.text();
            const rows = text.split('\n').map(row => row.split(','));
            const headers = rows[0].map(h => h.trim().toLowerCase()); // name, email, job_id, score
            const dataRows = rows.slice(1).filter(r => r.length > 1);

            // Get standard Jobs to fallback if no job_id provided
            const jobsSnapshot = await getDocs(collection(db, 'jobs'));
            const jobIds = jobsSnapshot.docs.map(d => d.id);
            if (jobIds.length === 0) throw new Error("No jobs found. Seed jobs first!");

            const batch = writeBatch(db);
            let count = 0;

            for (const row of dataRows) {
                if (row.length < 2) continue; // Skip empty rows

                const name = row[headers.indexOf('name')] || `Candidate ${count}`;
                const email = row[headers.indexOf('email')] || `user${count}@example.com`;
                const jobIdInput = row[headers.indexOf('job_id')];
                const scoreInput = row[headers.indexOf('score')];
                const credibilityInput = row[headers.indexOf('credibility')];
                const summaryInput = row[headers.indexOf('summary')];
                
                // 3. Get the specific job to generate relevant answers
                const assignedJob = jobsData.find(j => j.id === jobId);
                const mockAnswers = {};

                if (assignedJob && assignedJob.questions) {
                    assignedJob.questions.forEach((q, idx) => {
                        // Logic: High performers get 90% right, Low performers get 30% right
                        const isCorrect = Math.random() < (percentage / 100);
                        
                        if (q.type === 'mcq') {
                            // If correct, pick correct option (assuming first is correct for simplicity in mock, 
                            // or we just pick a random one if we don't know the answer key. 
                            // *Improvement*: In a real app we'd need the answer key. 
                            // For this mock, let's assume index 0 is correct, or just pick random.
                            // To make it realistic, let's pick a random option.
                            mockAnswers[idx] = q.options[Math.floor(Math.random() * q.options.length)];
                        } else if (q.type === 'coding') {
                            mockAnswers[idx] = isCorrect 
                                ? `// Optimal Solution\nfunction solution() { \n  // Implemented ${q.title} correctly \n  return true; \n}` 
                                : `// Incomplete Attempt\nfunction solution() { \n  console.log("Not sure..."); \n}`;
                        } else {
                            // Subjective
                            mockAnswers[idx] = isCorrect
                                ? `Detailed explanation demonstrating strong understanding of ${q.question}. citing specific examples and trade-offs.`
                                : `Vague answer with limited detail about ${q.question}.`;
                        }
                    });
                } else {
                    // Fallback if no questions found
                    mockAnswers["0"] = "Generic Answer A";
                    mockAnswers["1"] = "Generic Code Snippet";
                }

                const appData = {
                    userId: `csv_import_${Date.now()}_${count}`,
                    jobId: jobId,
                    jobTitle: assignedJob ? assignedJob.title : "Unknown Role", // Store title for fast lookup
                    percentage: percentage,
                    score: Math.round((percentage / 100) * (assignedJob?.questions?.length || 10)), 
                    total: assignedJob?.questions?.length || 10,
                    submittedAt: new Date().toISOString(),
                    tabSwitchViolation: Math.random() > 0.95, // Occasional cheater
                    answers: mockAnswers,
                    aiEvaluation: {
                        credibilityScore: credibilityInput ? parseFloat(credibilityInput) : (isHighPerformer ? 85 + Math.random() * 10 : 30 + Math.random() * 40),
                        technicalSummary: summaryInput || (isHighPerformer ? "Candidate demonstrates strong conceptual grasp and efficient coding style." : "Basic understanding shown, but lacks depth in core areas."),
                        recommendation: isHighPerformer ? "Highly Recommended" : "Needs Improvement",
                        skillSync: [
                            { skill: "Core Skills", claimed: "Expert", verified: isHighPerformer ? "Expert" : "Beginner", score: percentage },
                            { skill: "Problem Solving", claimed: "Advanced", verified: isHighPerformer ? "Advanced" : "Intermediate", score: percentage - 5 }
                        ]
                    },
                    mockUser: {
                        email: email,
                        name: name
                    }
                };
                
                const newRef = doc(collection(db, "results"));
                batch.set(newRef, appData);
                count++;
            }

            await batch.commit();
            setStatus({ type: 'success', message: `Successfully imported ${count} candidates from CSV.` });
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'CSV Upload Failed: ' + error.message });
        } finally {
            setLoading(false);
            setCsvFile(null);
        }
    };

    const massSeedApplications = async () => {
        if (!auth.currentUser) {
            setStatus({ type: 'error', message: 'Login required for seeding.' });
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', message: 'Starting mass seed of 1000 applications (Indian Demographics)...' });

        try {
            // Get Jobs
            const jobsSnapshot = await getDocs(collection(db, 'jobs'));
            const jobIds = jobsSnapshot.docs.map(d => d.id);
            if (jobIds.length === 0) throw new Error("No jobs found. Seed jobs first!");

            // Indian Mock Data Arrays
            const firstNames = ["Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Reyansh", "Muhammad", "Avyaan", "Krishna", "Ishaan", "Shaurya", "Atharva", "Ayaan", "Dhruv", "Kabir", "Rohan", "Vivaan", "Ansh", "Aaryamann", "Aaryan", "Abhimanyu", "Abhishek", "Aditya", "Ajay", "Akhil", "Akshay", "Amit", "Amol", "Anand", "Aniket", "Anirudh", "Ankit", "Anshul", "Anuj", "Anup", "Anurag", "Aravind", "Arun", "Aryan", "Ashish", "Ashok", "Ashwin", "Atul", "Avinash", "Ayush", "Bharat", "Bhavesh", "Bhuvan", "Brijesh", "Chaitanya", "Chandan", "Chetan", "Chirag", "Darshan", "Deepak", "Dev", "Devendra", "Dhaval", "Dheeraj", "Dhruv", "Dilip", "Dinesh", "Divish", "Gagan", "Ganesh", "Gaurav", "Gautam", "Girish", "Gopal", "Govind", "Gurdeep", "Hari", "Harish", "Harsh", "Harshad", "Hemant", "Himanshu", "Hitesh", "Hrithik", "Inder", "Ishwar", "Jai", "Jaideep", "Jatin", "Jay", "Jayant", "Jeevan", "Jitendra", "Kailash", "Kamal", "Karan", "Karthik", "Kaushal", "Kedar", "Keshav", "Kiran", "Kishan", "Kunal", "Lalit", "Lokesh", "Madan", "Madhav", "Mahesh", "Manish", "Manoj", "Mayank", "Mehul", "Mihir", "Mohane", "Mohit", "Mukul", "Nagaraj", "Nakul", "Naman", "Narendra", "Naresh", "Narayan", "Navin", "Neeraj", "Nikhil", "Nilesh", "Nishant", "Nitin", "Omkar", "Pankaj", "Parag", "Parmesh", "Parth", "Pavan", "Piyush", "Prabhat", "Pradeep", "Prakash", "Pramod", "Pranav", "Pranay", "Prasad", "Prashant", "Prateek", "Praveen", "Prem", "Pritam", "Puneet", "Punit", "Rahul", "Raj", "Rajan", "Rajat", "Rajeev", "Rajesh", "Rajiv", "Rakesh", "Raman", "Ramesh", "Ranjan", "Ranjeet", "Rishabh", "Rishi", "Ritesh", "Ritwik", "Rohan", "Rohit", "Sachin", "Sagar", "Sahil", "Sameer", "Sandeep", "Sanjay", "Sanket", "Santosh", "Sarvesh", "Satish", "Saurabh", "Shankar", "Shantanu", "Sharad", "Shashank", "Shekhar", "Shivam", "Shivansh", "Shreyas", "Shubham", "Siddharth", "Somesh", "Sourav", "Sridhar", "Srinivas", "Subhash", "Sudhir", "Suhas", "Sumit", "Sundar", "Sunil", "Suraj", "Suresh", "Sushant", "Sushil", "Swapnil", "Tanmay", "Tarun", "Tejas", "Tushar", "Uday", "Udit", "Ujjwal", "Umang", "Utkarsh", "Vaibhav", "Varun", "Vasant", "Vedant", "Veer", "Venkatesh", "Vibhor", "Vicky", "Vidit", "Vidya", "Vignesh", "Vijay", "Vikas", "Vikram", "Vikrant", "Vinay", "Vineet", "Vinod", "Vipin", "Vishal", "Vishesh", "Vishnu", "Vivek", "Yash", "Yogesh", "Yuvraj", "Aadya", "Aanya", "Aaradhya", "Aditi", "Ahana", "Akshara", "Amaya", "Amrita", "Ananya", "Anika", "Anushka", "Avni", "Bhavya", "Chahat", "Charu", "Dakshita", "Diya", "Drishti", "Esha", "Gauri", "Geetanjali", "Hamsini", "Harshita", "Hiral", "Ira", "Ishani", "Ishita", "Janya", "Jia", "Jivika", "Juhi", "Kaavya", "Kajal", "Kashish", "Kavya", "Khushi", "Kiara", "Kinjal", "Kirti", "Kritika", "Lavanya", "Mahika", "Maitreyi", "Manasvi", "Meera", "Megha", "Misha", "Mishka", "Myra", "Naina", "Nandini", "Navya", "Nehal", "Niharika", "Nikita", "Nisha", "Nitya", "Ojaswini", "Pari", "Parul", "Piya", "Pooja", "Prisha", "Priya", "Riya", "Roshni", "Saanvi", "Samaira", "Sanvi", "Sara", "Sejal", "Shanaya", "Shanya", "Shikha", "Shivangi", "Shreya", "Shruti", "Shweta", "Siya", "Sneha", "Sonali", "Sonia", "Suhani", "Suman", "Swara", "Tanvi", "Tara", "Trisha", "Urvi", "Vaibhavi", "Vanya", "Veda", "Vidhi", "Vidya", "Vrinda", "Yashvi", "Zara"];
            const lastNames = ["Acharya", "Agarwal", "Agrawal", "Ahluwalia", "Ahuja", "Amble", "Amin", "Anand", "Andra", "Anthony", "Apte", "Arora", "Arya", "Atwal", "Aurora", "Babu", "Badal", "Badami", "Bahl", "Bahri", "Bail", "Bains", "Bajaj", "Bajwa", "Bakshi", "Bal", "Bala", "Balakrishnan", "Balan", "Balasubramanian", "Bali", "Bandyopadhyay", "Banerjee", "Bansal", "Barad", "Barman", "Basak", "Bassi", "Basu", "Batra", "Bawa", "Bhaduri", "Bhagat", "Bhakta", "Bhalla", "Bhandari", "Bhardwaj", "Bhargava", "Bhasin", "Bhat", "Bhatia", "Bhatnagar", "Bhatt", "Bhattacharyya", "Bhatti", "Bhavsar", "Bir", "Biswas", "Biyani", "Bora", "Bose", "Brahmbhatt", "Brar", "Buch", "Buhari", "Burman", "Butt", "Chacko", "Chahal", "Chakraborty", "Chanda", "Chander", "Chandra", "Chandran", "Chandrasekhar", "Chandy", "Charan", "Chari", "Chatterjee", "Chaturvedi", "Chaudhary", "Chaudhry", "Chauhan", "Chawla", "Cheema", "Cherian", "Chhabra", "Chhadwa", "Chhajed", "Chhaya", "Chidambaram", "Choksi", "Chopra", "Choudhary", "Chowdhury", "D'Cruz", "D'Souza", "Dabas", "Dadlani", "Dalal", "Dalvi", "Damle", "Dandekar", "Dang", "Dani", "Dara", "Das", "Dasgupta", "Dash", "Dass", "Date", "Datta", "Dave", "Dayal", "De", "Deep", "Deo", "Deol", "Desai", "Deshmukh", "Deshpande", "Dev", "Devan", "Devi", "Dewan", "Dey", "Dhaliwal", "Dhamija", "Dhanjal", "Dhar", "Dharam", "Dhawan", "Dhillon", "Dhingra", "Dikshit", "Divan", "Dixit", "Doctor", "Dora", "Doshi", "Dravid", "Dube", "Dubey", "Dutta", "Dwarakanath", "Engineer", "Fauzdar", "Fernandes", "Furtado", "Gade", "Gala", "Gandhi", "Ganesan", "Ganesh", "Ganguly", "Garg", "Gautam", "Gavaskar", "George", "Ghosal", "Ghosh", "Gill", "Goda", "Gogoi", "Gola", "Gole", "Gomes", "Gopal", "Gopalan", "Gopinath", "Goswami", "Gour", "Goyal", "Grewal", "Grover", "Guha", "Gulati", "Gupta", "Gursahaney", "Guru", "Halder", "Handa", "Hans", "Hari", "Harpal", "H Hegde", "Hiremath", "Hirani", "Hoda", "Hota", "Iyengar", "Iyer", "Jadeja", "Jadhav", "Jagannathan", "Jain", "Jaiswal", "Jajoo", "Jalan", "Janakiraman", "Jani", "Jha", "Jhaveri", "Jindal", "Jog", "Johal", "Joshi", "Juneja", "Kadam", "Kadakia", "Kade", "Kakar", "Kala", "Kale", "Kalra", "Kamat", "Kamath", "Kamboj", "Kamdar", "Kamte", "Kanchan", "Kannan", "Kapadia", "Kapoor", "Kapur", "Kar", "Karanth", "Kashyap", "Kataria", "Kaul", "Kaur", "Kaushal", "Kaveri", "Kawa", "Keer", "Khanna", "Khan", "Khatri", "Khosla", "Khurana", "Kini", "Kishore", "Kulkarni", "Kumar", "Kundu", "Kurian", "Kuruvilla", "Lad", "Lahiri", "Lal", "Lalla", "Lamba", "Lanka", "Lata", "Lavakare", "Laxman", "Lele", "Lodha", "Loh", "Lohia", "Lobo", "Loomba", "Luthra", "Madan", "Madhavan", "Mahajan", "Mahal", "Maharaj", "Mahato", "Maheshwari", "Mahindra", "Majumdar", "Malhotra", "Mall", "Mallick", "Mallya", "Mammen", "Manchanda", "Mandal", "Mandavgane", "Mane", "Mangal", "Mangat", "Mangeshkar", "Mani", "Mann", "Mannan", "Manne", "Mantri", "Marwah", "Mascarenhas", "Master", "Mathai", "Mathew", "Mathur", "Matta", "Mehra", "Mehrotra", "Mehta", "Menon", "Merchant", "Minhas", "Mirhandani", "Mishra", "Misra", "Mistry", "Mital", "Mitra", "Mittal", "Mody", "Moghe", "Mohan", "Mohanty", "Mondal", "Monga", "Moni", "Moorthy", "Morparia", "Mukherjee", "Mukhopadhyay", "Muni", "Munshi", "Murali", "Murthy", "Murty", "Mutha", "Nadkarni", "Nagar", "Nagarajan", "Nagpal", "Naidu", "Naik", "Nair", "Nambiar", "Namboodiri", "Nanda", "Nandi", "Nanduri", "Narain", "Narang", "Narasimhan", "Narayan", "Narayanan", "Narula", "Natarajan", "Nath", "Nayak", "Nayar", "Nayyar", "Negi", "Nene", "Nigam", "Nihalani", "Nikam", "Nishad", "Niyogi", "Oak", "Oberoi", "Ojha", "Om", "Oommen", "Oza", "Padmanabhan", "Pai", "Pal", "Palan", "Pall", "Panda", "Pandey", "Pandit", "Pandya", "Panicker", "Panigrahi", "Panjwani", "Pant", "Parekh", "Parihar", "Parikh", "Parmar", "Parthan", "Parulkar", "Patel", "Pathak", "Patil", "Patnaik", "Patra", "Pattanayak", "Patwardhan", "Paul", "Pawar", "Pendse", "Pereira", "Perumal", "Phadke", "Phadnis", "Pillai", "Pinto", "Pir", "Poddar", "Prabhakar", "Prabhu", "Pradhan", "Prakash", "Prasad", "Pratap", "Puri", "Purohit", "Radhakrishnan", "Raghavan", "Raghunathan", "Rai", "Raj", "Raja", "Rajagopal", "Rajagopalan", "Rajan", "Rajaram", "Rajkumar", "Raju", "Rakshit", "Ram", "Ramachandran", "Ramakrishna", "Ramakrishnan", "Raman", "Ramanathan", "Ramaswamy", "Ramesh", "Rana", "Randhawa", "Ranganathan", "Ranjan", "Rao", "Rastogi", "Rath", "Rathi", "Rathod", "Rathore", "Raul", "Raval", "Ravi", "Ravindran", "Rawal", "Rawat", "Ray", "Reddy", "Rege", "Rehman", "Rodrigues", "Roy", "Sabharwal", "Sachar", "Sachdev", "Sachdeva", "Sagar", "Saha", "Sahai", "Sahay", "Sahgal", "Sahni", "Sahu", "Sai", "Saini", "Saluja", "Samant", "Samuel", "Sanghvi", "Sanyal", "Saraf", "Saran", "Sarabhai", "Sarin", "Sarkar", "Sarma", "Sastry", "Sathe", "Savla", "Sawant", "Saxena", "Sehgal", "Sekhar", "Selvan", "Sen", "Sengupta", "Seshadri", "Seth", "Sethi", "Setty", "Shah", "Shaikh", "Shankar", "Shanmugam", "Sharma", "Shastry", "Shenoy", "Sheth", "Shetty", "Shinde", "Shirke", "Shiv", "Shroff", "Shukla", "Sikka", "Singhal", "Singh", "Sinha", "Sodhi", "Solanki", "Somani", "Soman", "Soni", "Sood", "Srinivas", "Srinivasan", "Srivastava", "Subramaniam", "Subramanian", "Sud", "Sudarshan", "Sukumar", "Sule", "Sundaram", "Sundararajan", "Sur", "Suri", "Surve", "Swaminathan", "Swamy", "Tak", "Talwar", "Tandon", "Taneja", "Tank", "Tara", "Tata", "Tewari", "Thacker", "Thakkar", "Thakur", "Thapar", "Thatte", "Thomas", "Thorat", "Tiwari", "Toor", "Tripathi", "Trivedi", "Tyagi", "Uberoi", "Upadhyay", "Uppal", "Vaid", "Vaidya", "Vaidyanathan", "Vajpayee", "Vakil", "Varadarajan", "Varma", "Vartak", "Vasudev", "Vasudevan", "Vaz", "Venkat", "Venkatraman", "Verma", "Vig", "Vij", "Vijay", "Vinayak", "Vir", "Viswanathan", "Vohra", "Vora", "Vyas", "Wad", "Wadhwa", "Wagle", "Wahal", "Waikar", "Walia", "Wangu", "Warrier", "Wason", "Yadav", "Yagnik", "Yash", "Yogesh", "Zachariah"];

            const batchSize = 500; // Firestore batch limit
            let totalAdded = 0;
            let currentBatch = writeBatch(db);
            let operationCount = 0;

            for (let i = 0; i < 1000; i++) {
                const jobId = jobIds[Math.floor(Math.random() * jobIds.length)];
                const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
                const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
                const isHighPerformer = Math.random() > 0.7; // 30% high performers
                const percentage = isHighPerformer ? 85 + Math.random() * 14 : 40 + Math.random() * 40;
                
                const appData = {
                    userId: `mock_user_${Date.now()}_${i}`,
                    jobId: jobId,
                    percentage: percentage,
                    submittedAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(), // Random past date
                    tabSwitchViolation: Math.random() > 0.9, // 10% cheaters
                    aiEvaluation: {
                        credibilityScore: isHighPerformer ? 80 + Math.random() * 20 : 20 + Math.random() * 50,
                        technicalSummary: isHighPerformer ? "Strong conceptual grasp and efficient coding style." : "Basic understanding but lacks depth in core areas."
                    },
                    mockUser: {
                        email: `${fName.toLowerCase()}.${lName.toLowerCase()}@example.com`,
                        name: `${fName} ${lName}`
                    }
                };

                const newRef = doc(collection(db, "results"));
                currentBatch.set(newRef, appData);
                operationCount++;
                totalAdded++;

                if (operationCount >= batchSize) {
                    await currentBatch.commit();
                    currentBatch = writeBatch(db); // New batch
                    operationCount = 0;
                    setStatus({ type: 'info', message: `Seeded ${totalAdded} applications...` });
                }
            }

            if (operationCount > 0) {
                await currentBatch.commit();
            }

            setStatus({ type: 'success', message: `Successfully planted ${totalAdded} applications across all tracks.` });
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Mass seed failed: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                <div className="p-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Database Manager</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Environment Seeding</p>
                        </div>
                    </div>

                    {status.message && (
                        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest ${
                            status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 
                            status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                            {status.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : 
                             status.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                             <RefreshCw className="w-4 h-4 animate-spin" />}
                            {status.message}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={clearAllData}
                                disabled={loading}
                                className="col-span-2 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                Wipe Everything
                            </button>
                            
                            <button 
                                onClick={wipeApplicationsOnly}
                                disabled={loading}
                                className="col-span-2 bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 text-orange-600 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Wipe Apps Only
                            </button>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                        
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-3">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 text-center">
                                Bulk Upload Credentials
                            </label>
                            <input 
                                type="file" 
                                accept=".csv"
                                onChange={(e) => setCsvFile(e.target.files[0])}
                                className="block w-full text-xs text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-xl file:border-0
                                file:text-[10px] file:font-black file:uppercase file:tracking-widest
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            <button 
                                onClick={handleCsvUpload}
                                disabled={loading || !csvFile}
                                className="w-full bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <span className="flex items-center gap-2">
                                    <Database className="w-3 h-3" />
                                    Import CSV Data
                                </span>
                            </button>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>

                        <button 
                            onClick={addFakeJobs}
                            disabled={loading}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group disabled:opacity-50"
                        >
                            <span className="flex items-center gap-3">
                                <Plus className="w-4 h-4" />
                                Seed Jobs (Standard)
                            </span>
                        </button>

                        <button 
                            onClick={massSeedApplications}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group disabled:opacity-50 shadow-lg shadow-blue-500/30"
                        >
                            <span className="flex items-center gap-3">
                                <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Mass Seed (1000 Apps)
                            </span>
                            <div className="flex items-center gap-1">
                                <span className="text-[9px] opacity-70">BATCH</span>
                                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            </div>
                        </button>

                        <button 
                            onClick={() => { window.location.href = '/recruiter-dashboard' }}
                            className="w-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-400 px-6 py-5 rounded-3xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                            Warning: Wiping all data is permanent.<br/>
                            Auth accounts will remain but profile content will be reset.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataAdder;
