# Resume OCR and AI Job Matching Feature

## Overview
This feature enables candidates to upload their resumes (PDF or images) which are then:
1. Processed using OCR (Optical Character Recognition) to extract text
2. Analyzed by AI to match with available job opportunities
3. Ranked based on skills, experience, and job requirements

## Technologies Used

### OCR Processing
- **Tesseract.js**: JavaScript OCR engine for text extraction from images
- **PDF.js**: Mozilla's PDF rendering library for text extraction from PDF files

### AI Matching
- **Groq AI API**: Uses LLaMA 3.3 70B model for intelligent job matching
- Custom prompt engineering for accurate skill and experience matching

## Features

### 1. Multi-Format Support
- **PDF files**: Extracts text using PDF.js native extraction, falls back to OCR for scanned PDFs
- **Image files**: Uses Tesseract.js OCR for JPG, PNG, etc.
- **File size limit**: 5MB maximum

### 2. Text Extraction
- Hybrid approach: Tries native PDF text extraction first
- Falls back to OCR for scanned/image-based PDFs
- Processes each page individually for better accuracy
- Provides progress feedback during OCR processing

### 3. AI-Powered Job Matching
- Analyzes resume content against all available jobs
- Generates match scores (0-100) for each job
- Identifies matching skills from resume
- Highlights missing skills for each position
- Provides personalized recommendations

### 4. Candidate Profile Summary
- Extracts primary skills from resume
- Determines experience level
- Identifies key strengths
- Stored in Firestore for persistence

## User Flow

1. **Upload Resume**
   - Candidate clicks upload button on dashboard
   - Selects PDF or image file (max 5MB)
   
2. **Processing**
   - File uploaded to Firebase Storage
   - OCR extraction begins (with progress indicator)
   - Text extracted and stored in Firestore
   
3. **AI Analysis**
   - Extracted text sent to AI for matching
   - Jobs ranked by compatibility
   - Match results displayed on dashboard

4. **Personalized Recommendations**
   - Top matched jobs shown in dedicated section
   - Match score badges indicate fit level
   - Skills analysis shows strengths and gaps
   - One-click navigation to start assessments

## Implementation Details

### Service Layer (`resumeMatchingService.js`)

#### `extractTextFromPDF(file)`
- Loads PDF using PDF.js
- Iterates through each page
- Attempts native text extraction first
- Falls back to OCR if text extraction yields minimal results
- Returns combined text from all pages

#### `extractTextFromImage(file)`
- Uses Tesseract.js to perform OCR
- Provides progress logging
- Returns extracted text

#### `matchResumeWithJobs(resumeText, jobs)`
- Sends resume text and job listings to AI
- Receives structured JSON response with:
  - Match scores
  - Matching skills
  - Missing skills
  - Recommendations
  - Candidate summary
- Returns ranked jobs and candidate profile

### UI Components

#### Upload Interface
- Drag-and-drop zone with file input
- Visual feedback for upload/processing states
- Accept attribute limits to supported formats
- Disabled state during processing

#### AI Recommendations Section
- Only displayed when resume has been analyzed
- Shows candidate profile summary
- Displays top 4 matched jobs
- Color-coded match score badges
- Skills comparison (matching vs missing)

## Configuration

### Environment Variables
```
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### Firebase Storage Rules
Ensure storage rules allow authenticated users to upload resumes:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /resumes/{userId}/{fileName} {
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
  }
}
```

### Firestore Rules
Update user documents to allow resume data:
```javascript
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId;
}
```

## Usage Example

### For Candidates
1. Navigate to Candidate Dashboard
2. Click "Upload Resume" in the Talent Passport widget
3. Select your resume file (PDF or image)
4. Wait for processing (30 seconds - 2 minutes depending on file size)
5. View AI-matched job recommendations
6. Review match scores and skills analysis
7. Start assessments for recommended positions

### For Developers
```javascript
import { extractTextFromPDF, matchResumeWithJobs } from '../services/resumeMatchingService';

// Extract text from resume
const resumeText = await extractTextFromPDF(pdfFile);

// Match with jobs
const { rankedJobs, candidateSummary } = await matchResumeWithJobs(resumeText, availableJobs);

// Display results
setMatchResults(rankedJobs);
setCandidateSummary(candidateSummary);
```

## Performance Considerations

- **OCR Processing**: Can take 10-30 seconds per page for image-based PDFs
- **AI Matching**: Typically 3-5 seconds with Groq API
- **Total Processing Time**: 30 seconds - 2 minutes average
- **Storage**: First 10,000 characters of resume text stored in Firestore

## Future Enhancements

1. **Document Format Support**: Add .docx and .doc parsing
2. **Multi-language OCR**: Support resumes in different languages
3. **Skill Gap Analysis**: Detailed recommendations for missing skills
4. **Resume Score**: Overall resume quality assessment
5. **Auto-apply**: Option to auto-apply to highly matched positions
6. **Export Matches**: Download match report as PDF

## Troubleshooting

### OCR Not Working
- Check console for Tesseract.js errors
- Verify PDF.js worker is loading correctly
- Ensure file is not corrupted
- Try re-uploading with better quality scan

### AI Matching Fails
- Verify GROQ API key is set correctly
- Check API rate limits
- Ensure resume has sufficient text content
- Review console logs for API errors

### No Matches Shown
- Confirm resume upload completed successfully
- Check if any jobs are available
- Review extracted text in Firestore
- Verify AI returned valid JSON response

## License
MIT License - Part of the IntelliHire platform
