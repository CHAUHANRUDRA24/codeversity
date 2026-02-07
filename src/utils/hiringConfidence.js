/**
 * Calculate Hiring Confidence Index
 * Formula: (Test Score × 0.6) + (Resume Match × 0.3) + (Consistency Score × 0.1)
 * 
 * @param {number} testScore - Test performance score (0-100)
 * @param {number} resumeMatch - Resume match percentage (0-100)
 * @param {number} consistencyScore - Consistency/credibility score (0-100)
 * @returns {object} { score, level, color, label }
 */
export const calculateHiringConfidence = (testScore, resumeMatch = null, consistencyScore = null) => {
    // If resume match not provided, use test score as proxy
    const effectiveResumeMatch = resumeMatch !== null ? resumeMatch : testScore;

    // If consistency not provided, calculate based on variance
    const effectiveConsistency = consistencyScore !== null
        ? consistencyScore
        : Math.max(0, 100 - Math.abs(testScore - effectiveResumeMatch));

    // Calculate weighted confidence index
    const confidenceIndex = (
        (testScore * 0.6) +
        (effectiveResumeMatch * 0.3) +
        (effectiveConsistency * 0.1)
    );

    // Determine confidence level
    let level, color, label, icon;

    if (confidenceIndex >= 75) {
        level = 'high';
        color = 'emerald';
        label = 'High Confidence';
        icon = '🟢';
    } else if (confidenceIndex >= 50) {
        level = 'medium';
        color = 'amber';
        label = 'Medium Confidence';
        icon = '🟡';
    } else {
        level = 'low';
        color = 'rose';
        label = 'Low Confidence';
        icon = '🔴';
    }

    return {
        score: Math.round(confidenceIndex),
        level,
        color,
        label,
        icon,
        breakdown: {
            testScore: Math.round(testScore * 0.6),
            resumeMatch: Math.round(effectiveResumeMatch * 0.3),
            consistency: Math.round(effectiveConsistency * 0.1)
        }
    };
};

/**
 * Get color classes for Tailwind based on confidence level
 */
export const getConfidenceClasses = (level) => {
    const classes = {
        high: {
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            text: 'text-emerald-700 dark:text-emerald-400',
            border: 'border-emerald-200 dark:border-emerald-800',
            badge: 'bg-emerald-600'
        },
        medium: {
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            text: 'text-amber-700 dark:text-amber-400',
            border: 'border-amber-200 dark:border-amber-800',
            badge: 'bg-amber-600'
        },
        low: {
            bg: 'bg-rose-50 dark:bg-rose-900/20',
            text: 'text-rose-700 dark:text-rose-400',
            border: 'border-rose-200 dark:border-rose-800',
            badge: 'bg-rose-600'
        }
    };

    return classes[level] || classes.medium;
};
