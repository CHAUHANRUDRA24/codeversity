import { questionBank } from '../data/questionBank';

const KEYWORD_MAP = {
    'react': 'react',
    'javascript': 'javascript',
    'js': 'javascript',
    'python': 'python',
    'django': 'python',
    'flask': 'python',
    'node': 'node',
    'backend': 'node',
    'frontend': 'react', // heavy assumption for demo
    'web': 'javascript'
};

export const generateQuestions = (jobDescription, jobTitle) => {
    // 1. Analyze text for keywords
    const text = (jobTitle + " " + jobDescription).toLowerCase();
    
    // Detect skills
    const detectedCategories = new Set();
    Object.keys(KEYWORD_MAP).forEach(keyword => {
        if (text.includes(keyword)) {
            detectedCategories.add(KEYWORD_MAP[keyword]);
        }
    });

    // 2. Gather candidate questions
    let candidateQuestions = [];
    
    if (detectedCategories.size > 0) {
        // Pull questions from detected categories
        detectedCategories.forEach(category => {
            if (questionBank[category]) {
                candidateQuestions = [...candidateQuestions, ...questionBank[category]];
            }
        });
    } else {
        // Fallback to General and JS
        candidateQuestions = [...questionBank.general, ...questionBank.javascript];
    }

    // 3. Randomize and Select 5
    const shuffled = candidateQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
};
