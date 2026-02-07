import * as pdfjsLib from 'pdfjs-dist';
// Import the worker as a URL to work with Vite correctly
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import Tesseract from 'tesseract.js';

// Configure the worker source via Vite's URL import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Robust resume processing pipeline:
 * 1. Extraction from PDF Text Layer
 * 2. OCR Fallback via Canvas rendering if text layer is insufficient
 */
export const processResume = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Disable worker for simpler local dev, but keeping it Vite-compatible via GlobalWorkerOptions
        const loadingTask = pdfjsLib.getDocument({ 
            data: arrayBuffer,
            useWorkerFetch: false,
            isEvalSupported: false 
        });
        
        const pdf = await loadingTask.promise;
        let fullText = "";
        let pageProxies = [];

        console.log(`[Pipeline] PDF Loaded. Pages: ${pdf.numPages}`);

        // Try text layer extraction first
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            pageProxies.push(page);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + "\n";
        }

        const cleanedText = fullText.trim();
        
        // If text layer yields very little content, trigger OCR
        if (cleanedText.length < 150) {
            console.log("[Pipeline] Minimal text layer found. Triggering OCR fallback...");
            return await runOCR(pageProxies);
        }

        console.log("[Pipeline] Successful text layer extraction.");
        return cleanedText;

    } catch (error) {
        console.error("[Pipeline] PDF Processing Error:", error);
        throw new Error("Failed to parse PDF. The file might be corrupted or protected.");
    }
};

/**
 * Converts PDF pages to high-res canvases and runs OCR via Tesseract.js
 */
const runOCR = async (pages) => {
    console.log(`[OCR] Initializing Tesseract for ${pages.length} pages...`);
    
    // Create worker
    const worker = await Tesseract.createWorker('eng', 1, {
        logger: m => console.log(`[OCR Status] ${m.status}: ${Math.round(m.progress * 100)}%`),
    });

    try {
        let combinedText = "";

        for (const page of pages) {
            const viewport = page.getViewport({ scale: 2.0 }); // High scale for better OCR accuracy
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Recognize text from the rendered canvas
            const { data: { text } } = await worker.recognize(canvas);
            combinedText += text + "\n";
        }

        return combinedText.trim();
    } catch (error) {
        console.error("[OCR] Execution Error:", error);
        throw new Error("Optical Character Recognition failed.");
    } finally {
        await worker.terminate();
    }
};
