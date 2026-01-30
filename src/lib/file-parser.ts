import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Disable worker to avoid browser-specific dependencies
pdfjsLib.GlobalWorkerOptions.workerSrc = "";

export async function parseFile(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const extension = fileName.toLowerCase().split(".").pop();

  try {
    switch (extension) {
      case "pdf":
        return await parsePDF(buffer);
      case "docx":
      case "doc":
        return await parseDOCX(buffer);
      case "txt":
        return buffer.toString("utf-8");
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  } catch (error) {
    console.error(`Error parsing file ${fileName}:`, error);
    throw error;
  }
}

async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      standardFontDataUrl: undefined,
    });
    
    const pdf = await loadingTask.promise;
    const textParts: string[] = [];

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      textParts.push(pageText);
    }

    return textParts.join("\n");
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to parse PDF file");
  }
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("DOCX parsing error:", error);
    throw new Error("Failed to parse DOCX file");
  }
}

export function getFileExtension(fileName: string): string {
  return fileName.toLowerCase().split(".").pop() || "";
}

export function isValidCVFile(fileName: string): boolean {
  const validExtensions = ["pdf", "docx", "doc", "txt"];
  const extension = getFileExtension(fileName);
  return validExtensions.includes(extension);
}
