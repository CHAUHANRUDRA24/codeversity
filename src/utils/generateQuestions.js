import { questionBank, subjectiveBank, codingBank } from '../data/questionBank';

const KEYWORD_MAP = {
    'react': 'react',
    'javascript': 'javascript',
    'js': 'javascript',
    'python': 'python',
    'django': 'python',
    'flask': 'python',
    'node': 'node',
    'backend': 'node',
    'frontend': 'react', 
    'web': 'javascript'
};

const shuffleArray = (arr) => [...arr].sort(() => 0.5 - Math.random());

export const generateQuestions = (jobDescription, jobTitle) => {
    // 1. Analyze text for keywords
    const text = (jobTitle + " " + jobDescription).toLowerCase();
    
    // Detect skills
    const detectedCategories = new Set(['general']); // Always include general 
    Object.keys(KEYWORD_MAP).forEach(keyword => {
        if (text.includes(keyword)) {
            detectedCategories.add(KEYWORD_MAP[keyword]);
        }
    });
    
    // Fallback: If only general detected, add JS as baseline
    if (detectedCategories.size === 1) detectedCategories.add('javascript');

    // 2. Gather candidates for each section
    let mcqPool = [];
    let subjectivePool = [];
    let codingPool = [];
    
    detectedCategories.forEach(category => {
        if (questionBank[category]) mcqPool.push(...questionBank[category]);
        if (subjectiveBank[category]) subjectivePool.push(...subjectiveBank[category]);
        if (codingBank[category]) codingPool.push(...codingBank[category]);
    });

    // 3. Select final questions (Deduplication handled by Sets implicitly if banks don't overlap much, but banks are distinct)
    // Actually, distinct banks have distinct questions.
    // If I add 'general' and 'javascript', they are distinct.
    
    return {
        mcqs: shuffleArray(mcqPool).slice(0, 5),
        subjective: shuffleArray(subjectivePool).slice(0, 2),
        coding: shuffleArray(codingPool).slice(0, 1)
    };
};
