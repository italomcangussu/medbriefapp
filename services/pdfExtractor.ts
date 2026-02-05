// PDF Text Extraction using PDF.js from CDN
// This runs entirely in the browser - no server needed

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs';
const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';

let pdfjsLib: any = null;

async function loadPdfJs() {
    if (pdfjsLib) return pdfjsLib;

    // Dynamically import PDF.js from CDN
    pdfjsLib = await import(/* @vite-ignore */ PDFJS_CDN);
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;

    return pdfjsLib;
}

export async function extractTextFromPdf(file: File): Promise<string> {
    const pdfjs = await loadPdfJs();

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF document
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');

        fullText += pageText + '\n\n';
    }

    return fullText.trim();
}
