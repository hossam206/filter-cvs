export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { parseFile, isValidCVFile } from "@/lib/file-parser";
import { parseCVWithGemini } from "@/lib/gemini";
import { CVData } from "@/types/cv";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files uploaded" },
        { status: 400 },
      );
    }

    const results: CVData[] = [];
    const errors: { fileName: string; error: string }[] = [];

    for (const file of files) {
      if (!isValidCVFile(file.name)) {
        errors.push({
          fileName: file.name,
          error: "Invalid file type. Supported: PDF, DOCX, DOC, TXT",
        });
        continue;
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const textContent = await parseFile(buffer, file.name);

        if (!textContent || textContent.trim().length < 50) {
          errors.push({
            fileName: file.name,
            error: "File content is too short or empty",
          });
          continue;
        }

        const cvData = await parseCVWithGemini(textContent, file.name);
        results.push(cvData);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        errors.push({
          fileName: file.name,
          error:
            error instanceof Error ? error.message : "Failed to process file",
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
      processedCount: results.length,
      totalCount: files.length,
    });
  } catch (error) {
    console.error("Parse CV API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
