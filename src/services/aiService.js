
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (!API_KEY) {
    console.warn("Groq API Key is missing. AI features will not work.");
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function groqFetch(messages, temperature = 0.5) {
    if (!API_KEY) throw new Error("API Key is missing");

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            messages,
            model: "llama-3.3-70b-versatile",
            temperature,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Groq API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "{}";
}

export const generateAssessmentFromJD = async (jobTitle, jobDescription, experienceLevel) => {
    const prompt = `
        You are an expert technical recruiter and assessment creator.
        Create a comprehensive JSON assessment for the following role:
        
        Role: ${jobTitle}
        Experience Level: ${experienceLevel}
        Job Description: ${jobDescription}

        Generate a JSON object with this exact schema:
        {
            "mcqs": [
                { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "Correct Option Text" }
            ],
            "subjective": [
                "Question 1", "Question 2"
            ],
            "coding": [
                { "title": "...", "description": "...", "starterCode": "..." }
            ]
        }

        Requirements:
        - 5 MCQs: challenging, specific to the tech stack in JD.
        - 2 Subjective Questions: scenario-based, testing problem-solving.
        - 1 Coding Challenge: relevant to the role, with starter code.
        - Output *only* the valid JSON. Do not use Markdown code blocks.
    `;

    try {
        const jsonStr = await groqFetch([
            { role: "system", content: "You are a helpful assistant that outputs JSON." },
            { role: "user", content: prompt }
        ], 0.5);
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
};

export const evaluateAnswer = async (question, userAnswer, type, context = "") => {
    const prompt = `
        Evaluate the following candidate answer for a ${type} question.
        
        Question: ${question}
        Context/Correct Answer (if any): ${context}
        Candidate Answer: ${userAnswer}

        Provide a JSON response:
        {
            "score": (0-10 integer),
            "feedback": (string, 1-2 sentences explaining the score),
            "credibility": (0-100 integer, confidence that this is a genuine, skilled answer)
        }
    `;

    try {
        const jsonStr = await groqFetch([
            { role: "system", content: "You are a helpful assistant that outputs JSON." },
            { role: "user", content: prompt }
        ], 0.3);
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI Evaluation Error:", error);
        return { score: 0, feedback: "Error evaluating answer", credibility: 0 };
    }
};

export const matchResumeToJobs = async (resumeText, jobs) => {
    // Simplify jobs list to reduce token usage
    const jobsSummary = jobs.map(j => ({
        id: j.id,
        title: j.title,
        description: j.description.substring(0, 300) // Truncate for efficiency
    }));

    const prompt = `
        You are a smart recruiter. Match the following resume text to the available job openings.
        
        Resume Text:
        "${resumeText.substring(0, 2000)}"

        Available Jobs:
        ${JSON.stringify(jobsSummary)}

        For each job, provide a relevance score (0-100) and a brief reason.
        Return a JSON object in this format:
        {
            "matches": [
                { "jobId": "...", "score": 85, "reason": "..." }
            ]
        }
    `;

    try {
        const jsonStr = await groqFetch([
            { role: "system", content: "You are a detailed-oriented recruiter. Output valid JSON." },
            { role: "user", content: prompt }
        ], 0.2);
        const result = JSON.parse(jsonStr);
        return result.matches || [];
    } catch (error) {
        console.error("AI Matching Error:", error);
        return [];
    }
};

export const generateRejectionReason = async (jobTitle, jobDescription, results) => {
    const prompt = `
        You are an expert technical recruiter. Analyze the following candidate's assessment results for the role of ${jobTitle}.

        Job Description: ${jobDescription}

        Candidate Performance:
        ${JSON.stringify(results.details ? results.details.map(r => ({
        question: r.questionId, // Ideally we should pass the question text, but ID might suffice if descriptive or we rely on the type/feedback
        type: r.type,
        score: r.score,
        feedback: r.feedback
    })).slice(0, 10) : [])} 
        
        Total Score: ${results.totalScore} / ${results.totalQuestions}
        
        Generate a "Rejection/Acceptance Summary" in valid JSON format:
        {
            "status": "Rejected" or "Accepted" (Assume Rejected if score < 60%),
            "reason": "A clear, simple sentence explaining WHY, tailored for a recruiter to understand or share.",
            "strengths": ["List of 2-3 key strengths based on correct answers"],
            "weaknesses": ["List of 2-3 key weaknesses based on incorrect answers"]
        }
        
        Tone: Professional, constructive, and explanatory.
    `;

    try {
        const jsonStr = await groqFetch([
            { role: "system", content: "You are a helpful assistant that outputs JSON." },
            { role: "user", content: prompt }
        ], 0.4);
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI Rejection Analysis Error:", error);
        return {
            status: "Review",
            reason: "Could not generate automated analysis.",
            strengths: [],
            weaknesses: []
        };
    }
};

export const analyzeResume = async (resumeText) => {
    const prompt = `
        You are an expert career coach and technical recruiter.
        Analyze the following resume text and provide a structured summary.
        
        Resume Text:
        "${resumeText.substring(0, 3000)}"

        Extract and infer the following:
        - Technical Skills (array of strings)
        - Years of Experience (string, e.g. "5+ years")
        - Recommended Job Role (string, e.g. "Senior Frontend Engineer")
        - Top 3 Job Categories (array of strings, e.g. ["Frontend", "Full Stack", "UI/UX"])
        - Resume Quality Score (0-100 integer)

        Output ONLY valid JSON. No markdown backticks.
        JSON format:
        {
            "technicalSkills": ["React", "Node.js", ...],
            "experience": "...",
            "roleRecommendation": "...",
            "matchingCategories": ["...", ...],
            "resumeQualityScore": 85
        }
    `;

    try {
        const jsonStr = await groqFetch([
            { role: "system", content: "You are a helpful assistant that outputs valid JSON." },
            { role: "user", content: prompt }
        ], 0.3);
        
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            // Handle if Groq wraps in markdown
            const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        }
    } catch (error) {
        console.error("AI Analysis Error:", error);
        return {
            technicalSkills: [],
            experience: "Unknown",
            roleRecommendation: "Generalist",
            matchingCategories: [],
            resumeQualityScore: 0
        };
    }
};


export const analyzeApplicationIntegrity = async (resumeData, results, jobDescription) => {
    const prompt = `
        You are an expert fraud detection and risk analyst for a technical hiring platform.
        Analyze the following candidate application for signs of "fake" candidates, resume-skill mismatches, or bot-driven behavior.

        1. Resume Profile:
        ${JSON.stringify(resumeData || {})}

        2. Assessment Performance:
        ${JSON.stringify(results)}

        3. Job Description:
        ${jobDescription}

        Detect the following:
        - **Resume-Skill Mismatch**: Does the candidate fail basic questions for skills they claim to be "Expert" in? (e.g. Claims 5 years React, misses basic React Question).
        - **Guessing/Randomness**: Are the answers following a pattern (A, A, A... or A, B, C, D...) or purely random guesses on hard questions?
        - **Bot/AI Behavior**: Is the response style robotic, too perfect, or nonsensical?

        Output a JSON object:
        {
            "integrityScore": (0-100, where 100 is perfectly honest/human, <50 is very suspicious),
            "flags": ["list of specific flags, e.g. 'Claimed Expert React but scored 0% on React', 'Suspiciously linear answer pattern'"],
            "botProbability": (0-100),
            "skillValidation": [
                { "skill": "React", "claimed": "Expert", "performance": "Low/High/Mismatch", "status": "Verified/Suspicious" }
            ],
            "conclusion": "Brief summary of integrity analysis."
        }
    `;

    try {
        const jsonStr = await groqFetch([
            { role: "system", content: "You are a specific integrity analysis engine. Output valid JSON." },
            { role: "user", content: prompt }
        ], 0.3);
        const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Integrity Analysis Error:", error);
        return { integrityScore: 100, flags: [], botProbability: 0, conclusion: "Analysis unavailable" };
    }
};

export const gradeEntireAssessment = async (job, userAnswers, context = {}) => {
    // Context can contain violations, resumeData, etc.
    const violations = context.violations || (context.tabSwitch !== undefined ? context : {});
    const resumeData = context.resumeData || null;

    // Construct the assessment data for the AI
    const assessmentData = job.questions.map((q, index) => ({
        id: q.id || `q${index}`,
        type: q.type,
        question: q.question,
        options: q.options || [],
        userAnswer: userAnswers[index] || "No Answer Provided"
    }));

    const prompt = `
        You are an expert technical interviewer and grader with advanced PLAGIARISM and ANOMALY detection capabilities. 
        Evaluate the following candidate assessment for the role of "${job.title}".
        
        Job Description Context: ${job.description}
        
        Assessment Data (Questions and User Answers):
        ${JSON.stringify(assessmentData)}

        Behavioral Violations Logs (Anti-Cheating System):
        ${JSON.stringify(violations)}
        (Includes tab switches, copy-paste attempts, etc.)

        Instructions:
        1. For MCQs: Determine the strictly correct answer from the options. Compare with user's answer.
        2. For Subjective: Evaluate the quality, depth, and correctness of the user's response.
           - FLAGGING: If the text changes style abruptly or looks like an AI-generated essay (too perfect/generic), flag it.
        3. For Coding: 
           - Check if the logic is correct and solves the problem.
           - PLAGIARISM CHECK: Analyze if the code is a "textbook" solution found online. Real candidates often have minor quirks or comments. 
           - ANOMALY CHECK: If the code is perfect but there are high paste violations, significantly lower the credibility score.
           - KEYBOARD check: If the code is complex but typed perfectly without typical human variations (if visible), or if it matches LeetCode solutions exactly, flag it.

        Output a JSON object with this EXACT structure:
        {
            "totalScore": (sum of individual scores),
            "maxScore": (total possible points, assume 10 points per question),
            "percentage": (0-100),
            "credibilityScore": (0-100, where 100 is clean, <50 is likely cheated),
            "cheatingAnalysis": "Brief analysis of potential cheating based on violations and answer patterns.",
            "feedback": "Overall summary of the candidate's performance in 2-3 sentences.",
            "skillsAnalysis": {
                "Skill Name 1": { "score": 8, "total": 10 },
                "Skill Name 2": { "score": 15, "total": 20 }
            },
            "questions": [
                {
                    "id": "question id",
                    "question": "question text",
                    "userAnswer": "user's full answer",
                    "correctAnswer": "The correct option or a model answer",
                    "isCorrect": boolean,
                    "score": (0-10),
                    "feedback": "Brief explanation of why it is correct or wrong",
                    "plagiarismFlag": boolean (true if suspicious)
                }
            ]
        }
    `;


    try {
        const jsonStr = await groqFetch([
            { role: "system", content: "You are a precise grading engine. Output strictly valid JSON." },
            { role: "user", content: prompt }
        ], 0.2);
        
        // Handle potential markedown wrapping
        const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        const gradingResult = JSON.parse(cleanJson);

        if (resumeData) {
            try {
                // Run Integrity Check
                const integrity = await analyzeApplicationIntegrity(resumeData, gradingResult, job.description);
                gradingResult.integrityAnalysis = integrity;
            } catch (err) {
                console.error("Error running integrity check:", err);
            }
        }

        return gradingResult;
    } catch (error) {
        console.error("AI Grading Error:", error);
        // Fallback or re-throw
        throw new Error("Failed to grade assessment with AI.");
    }
};
