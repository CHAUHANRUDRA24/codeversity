
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
