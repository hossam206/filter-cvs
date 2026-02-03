import mammoth from "mammoth";

export async function parseFile(
  buffer: Buffer,
  fileName: string,
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
    // pdf2json is a CommonJS module
    const PDFParser = require("pdf2json");

    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        reject(new Error(errData.parserError));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          // Extract text from all pages
          const text = pdfData.Pages.map((page: any) => {
            return page.Texts.map((textItem: any) => {
              return textItem.R.map((r: any) => {
                try {
                  return decodeURIComponent(r.T);
                } catch (e) {
                  // If decoding fails, return the text as-is
                  return r.T;
                }
              }).join("");
            }).join(" ");
          }).join("\n");

          resolve(text);
        } catch (err) {
          reject(err);
        }
      });

      pdfParser.parseBuffer(buffer);
    });
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error(
      `Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
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
