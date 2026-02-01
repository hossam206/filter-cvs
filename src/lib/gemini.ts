import "server-only";

import { GoogleGenAI } from "@google/genai";
import { CVData, Company } from "@/types/cv";
import { v4 as uuidv4 } from "uuid";

/**
 * Lazy, server-only Gemini client
 * IMPORTANT: do NOT initialize at module scope
 */
let client: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  if (!client) {
    client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return client;
}

export async function parseCVWithGemini(
  textContent: string,
  fileName: string,
): Promise<CVData> {
  const prompt = `
You are an expert CV/Resume parser. Analyze the following CV text and extract structured information.

Return a JSON object with the following structure (and nothing else, just the raw JSON):
{
  "name": "Full name of the candidate",
  "email": "Email address if found, or null",
  "phone": "Phone number if found, or null",
  "yearsOfExperience": <number - total years of professional experience, estimate if not explicit>,
  "skills": ["skill1", "skill2", ...],
  "companies": [
    {
      "name": "Company name",
      "position": "Job title/position",
      "duration": "Duration worked (e.g., '2020-2023' or '2 years')"
    }
  ],
  "summary": "A brief 2-3 sentence professional summary of this candidate"
}

Rules:
- Return ONLY valid JSON
- No markdown
- No explanations
- Do NOT invent data
- If dates are unclear, estimate conservatively
- Do NOT include internships unless stated as full-time

Schema:
{
  "name": "string",
  "email": "string | null",
  "phone": "string | null",
  "yearsOfExperience": number,
  "skills": string[],
  "companies": [
    {
      "name": "string",
      "position": "string",
      "duration": "string"
    }
  ],
  "summary": "string"
}

CV TEXT:
"""
${textContent}
"""
`;

  try {
    const response = await getGeminiClient().models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    // Defensive JSON extraction
    let jsonStr = text;
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      jsonStr = match[0];
    }

    const parsed = JSON.parse(jsonStr);

    return {
      id: uuidv4(),
      fileName,
      name: parsed.name || "Unknown",
      email: parsed.email ?? undefined,
      phone: parsed.phone ?? undefined,
      yearsOfExperience: Number(parsed.yearsOfExperience) || 0,
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      companies: Array.isArray(parsed.companies)
        ? parsed.companies.map((c: Company) => ({
            name: c.name || "Unknown Company",
            position: c.position || "Unknown Position",
            duration: c.duration || "N/A",
          }))
        : [],
      summary: parsed.summary || "No summary available",
      rawText: textContent,
    };
  } catch (error) {
    console.error("Error parsing CV with Gemini:", error);
    throw new Error("Failed to parse CV content");
  }
}

export function calculateMatchScore(
  cv: CVData,
  criteria: {
    minExperience?: number;
    maxExperience?: number;
    skills?: string[];
    searchQuery?: string;
  },
): number {
  let score = 0;

  // Experience (50%)
  if (
    criteria.minExperience !== undefined ||
    criteria.maxExperience !== undefined
  ) {
    const min = criteria.minExperience ?? 0;
    const max = criteria.maxExperience ?? 100;

    if (cv.yearsOfExperience >= min && cv.yearsOfExperience <= max) {
      score += 50;
    } else if (cv.yearsOfExperience < min) {
      score += Math.max(0, 50 - (min - cv.yearsOfExperience) * 5);
    } else {
      score += Math.max(0, 50 - (cv.yearsOfExperience - max) * 3);
    }
  }

  // Skills (40%)
  if (criteria.skills && criteria.skills.length > 0) {
    const cvSkillsLower = cv.skills.map((s) => s.toLowerCase());
    const matchedSkills = criteria.skills.filter((skill) =>
      cvSkillsLower.some((cvSkill) => cvSkill.includes(skill.toLowerCase())),
    );
    score += (matchedSkills.length / criteria.skills.length) * 40;
  }

  // Keyword relevance (10%)
  if (criteria.searchQuery) {
    const q = criteria.searchQuery.toLowerCase();
    if (
      cv.summary.toLowerCase().includes(q) ||
      cv.skills.some((s) => s.toLowerCase().includes(q))
    ) {
      score += 10;
    }
  }

  return Math.min(100, Math.round(score));
}
