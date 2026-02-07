import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text from PDF using OCR
 * @param {File} file - PDF file to process
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        // Process each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);

            // First try native text extraction
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');

            // If native extraction yields little text, use OCR
            if (pageText.trim().length < 50) {
                // Render page to canvas for OCR
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                // Convert canvas to image and run OCR
                const imageData = canvas.toDataURL('image/png');
                const ocrResult = await Tesseract.recognize(imageData, 'eng', {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            console.log(`OCR Progress Page ${pageNum}: ${Math.round(m.progress * 100)}%`);
                        }
                    }
                });

                fullText += ocrResult.data.text + '\n\n';
            } else {
                fullText += pageText + '\n\n';
            }
        }

        return fullText.trim();
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
};

/**
 * Extract text from image using OCR
 * @param {File} file - Image file to process
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromImage = async (file) => {
    try {
        const result = await Tesseract.recognize(file, 'eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
            }
        });

        return result.data.text;
    } catch (error) {
        console.error('Error extracting text from image:', error);
        throw new Error('Failed to extract text from image');
    }
};

/**
 * Match resume text with available jobs using AI
 * @param {string} resumeText - Extracted resume text
 * @param {Array} jobs - Array of job objects
 * @returns {Promise<Array>} - Jobs ranked by match score
 */
export const matchResumeWithJobs = async (resumeText, jobs) => {
    const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

    if (!API_KEY) {
        throw new Error("API Key is missing");
    }

    const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    const jobsSummary = jobs.map((job, index) => ({
        index,
        id: job.id,
        title: job.title,
        description: job.description,
        experienceLevel: job.experienceLevel
    }));

    const prompt = `
        You are an expert technical recruiter and resume matcher.
        
        Analyze this resume and match it with the provided job opportunities:
        
        RESUME:
        ${resumeText}
        
        AVAILABLE JOBS:
        ${JSON.stringify(jobsSummary, null, 2)}
        
        For each job, provide:
        1. A match score (0-100) based on skills, experience, and keywords
        2. A brief explanation of why it's a good/bad match
        3. Key matching skills
        4. Missing skills or gaps
        
        Return a JSON object with this exact schema:
        {
            "matches": [
                {
                    "jobId": "string",
                    "jobTitle": "string",
                    "matchScore": number (0-100),
                    "matchReason": "string",
                    "matchingSkills": ["skill1", "skill2"],
                    "missingSkills": ["skill1", "skill2"],
                    "recommendation": "Highly Recommended" | "Good Fit" | "Possible Match" | "Not Recommended"
                }
            ],
            "candidateSummary": {
                "primarySkills": ["skill1", "skill2"],
                "experienceLevel": "string",
                "strengths": ["strength1", "strength2"]
            }
        }
        
        Sort matches by matchScore in descending order.
        Output *only* valid JSON. No markdown code blocks.
    `;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are a helpful assistant that outputs JSON." },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.3,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`AI Matching Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0]?.message?.content || "{}");

        // Merge AI results with original job data
        const rankedJobs = result.matches.map(match => {
            const originalJob = jobs.find(j => j.id === match.jobId);
            return {
                ...originalJob,
                aiMatch: match
            };
        });

        return {
            rankedJobs,
            candidateSummary: result.candidateSummary
        };
    } catch (error) {
        console.error('AI Matching Error:', error);
        throw error;
    }
};
