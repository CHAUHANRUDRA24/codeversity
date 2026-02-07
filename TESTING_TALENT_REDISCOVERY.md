# Testing the Talent Re-Discovery Engine

## Overview
The **Talent Re-Discovery Engine** is a new feature that automatically maps rejected candidates to other potential roles where they might be a better fit, instead of simply discarding them.

## Steps to Test

1.  **Access the Dashboard**
    - Navigate to the **Recruiter Dashboard** in your application (usually `http://localhost:5173/recruiter-dashboard`).
    - Ensure you are logged in.

2.  **Select a Job Track**
    - In the "Deployment Pipeline" section, click on any active job (e.g., "Full Stack Developer") to view its candidates.

3.  **Reject a Candidate**
    - Scroll down to the **Mission Candidates** table.
    - Locate the **Action** column on the far right.
    - Click the **Reject icon** (looks like a logout/exit door) for any candidate.

4.  **Observe the Talent/Re-Discovery Engine**
    - **Effect**: The candidate will be removed from the current list.
    - **Result**: A new, premium-styled section titled **Talent Re-Discovery Engine** will appear above the Job Pipeline.
    - **Verification**: 
        - Check that the rejected candidate is listed there.
        - Verify they are mapped to a *different* role (e.g., "Data Analyst Intern" or another active track).
        - Verify a high "Match Score" is displayed, simulating the AI's analysis.

## Key Features to Notice
- **Premium UI**: The section uses a gradient background and glassmorphism effects to stand out.
- **Immediate Feedback**: The rejection and rediscovery happen instantly.
- **Preservation**: The candidate is not lost; they are "preserved" for another opportunity.
