
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

export const generateRejectionReason = async (jobTitle, jobDescription, results) => {
    const prompt = `
        You are an expert technical recruiter. Analyze the following candidate's assessment results for the role of ${jobTitle}.

        Job Description: ${jobDescription}

        Candidate Performance:
        ${JSON.stringify(results.details.map(r => ({
        question: r.questionId, // Ideally we should pass the question text, but ID might suffice if descriptive or we rely on the type/feedback
        type: r.type,
        score: r.score,
        feedback: r.feedback
    })).slice(0, 10))} 
        
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
