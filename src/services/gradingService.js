import { evaluateAnswer } from './aiService';

export const gradeAssessment = async (job, answers) => {
    let totalScore = 0;
    let totalMaxScore = job.questions.length; 
    // Assuming 1 point per question for now, or we can weight them.
    // Let's stick to the current logic: 1 point per question.
    
    const results = {
        details: [],
        totalScore: 0,
        totalQuestions: totalMaxScore,
        aiAnalysis: []
    };

    // We process sequentially or parallel. Parallel is faster.
    const gradingPromises = job.questions.map(async (q, index) => {
        const userAnswer = answers[index];
        
        let result = {
            questionId: q.id,
            type: q.type,
            score: 0,
            feedback: "",
            userAnswer: userAnswer,
            isCorrect: false
        };

        if (!userAnswer) {
            result.feedback = "No answer provided.";
            return result;
        }

        if (q.type === 'mcq') {
            // Local grading for MCQ
            if (userAnswer === q.correctAnswer) {
                result.score = 1;
                result.isCorrect = true;
                result.feedback = "Correct answer.";
            } else {
                result.feedback = `Incorrect. Correct answer was: ${q.correctAnswer}`;
            }
        } else if (q.type === 'subjective' || q.type === 'coding') {
            // AI grading
            try {
                // Determine context based on question type
                const context = q.type === 'coding' ? q.description : q.question;
                const aiEvaluation = await evaluateAnswer(q.question, userAnswer, q.type, context);
                
                // Normalize AI score (0-10) to our 1-point scale
                // If AI gives >= 7/10, we count it as correct (1 point)
                // Or we can start using fractional scores? 
                // Let's stick to 1 point max for consistency with existing system, 
                // but store the detailed AI score for analytics.
                
                result.aiScore = aiEvaluation.score; // 0-10
                result.feedback = aiEvaluation.feedback;
                result.credibility = aiEvaluation.credibility;

                if (aiEvaluation.score >= 7) {
                    result.score = 1;
                    result.isCorrect = true;
                } else if (aiEvaluation.score >= 4) {
                    result.score = 0.5; // Partial credit
                }
            } catch (error) {
                console.error("Grading error:", error);
                result.feedback = "Error during AI evaluation.";
            }
        }

        return result;
    });

    const gradedQuestions = await Promise.all(gradingPromises);

    results.details = gradedQuestions;
    results.totalScore = gradedQuestions.reduce((sum, q) => sum + q.score, 0);

    // Calculate average credibility (only for AI-graded questions that have it)
    const aiGradedQuestions = gradedQuestions.filter(q => q.credibility !== undefined);
    if (aiGradedQuestions.length > 0) {
        const totalCredibility = aiGradedQuestions.reduce((sum, q) => sum + q.credibility, 0);
        results.credibilityScore = Math.round(totalCredibility / aiGradedQuestions.length);
    } else {
        results.credibilityScore = 100; // Default if no AI questions (e.g. all MCQ)
    }
    
    return results;
};
