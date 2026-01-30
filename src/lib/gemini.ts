import { GoogleGenerativeAI } from "@google/generative-ai";
import { CVData, Company } from "@/types/cv";
import { v4 as uuidv4 } from "uuid";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "AIzaSyABGvLHVmtmGaGLisTcZMDSz8BoHZc7eiY"
);

// ✅ موديل شغال
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

export async function parseCVWithGemini(
  textContent: string,
  fileName: string,
): Promise<CVData> {
  const prompt = `
Return ONLY valid JSON. No explanation. No markdown.

{
  "name": "",
  "email": null,
  "phone": null,
  "yearsOfExperience": 0,
  "skills": [],
  "companies": [],
  "summary": ""
}

CV Text:
${textContent}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleanJson = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanJson);

    return {
      id: uuidv4(),
      fileName,
      name: parsed.name || "Unknown",
      email: parsed.email || undefined,
      phone: parsed.phone || undefined,
      yearsOfExperience: parsed.yearsOfExperience || 0,
      skills: parsed.skills || [],
      companies: (parsed.companies || []).map((c: Company) => ({
        name: c.name || "Unknown Company",
        position: c.position || "Unknown Position",
        duration: c.duration || "N/A",
      })),
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
  let score = 50; // Base score

  // Experience matching (up to 30 points)
  if (
    criteria.minExperience !== undefined ||
    criteria.maxExperience !== undefined
  ) {
    const min = criteria.minExperience || 0;
    const max = criteria.maxExperience || 100;

    if (cv.yearsOfExperience >= min && cv.yearsOfExperience <= max) {
      score += 30;
    } else if (cv.yearsOfExperience < min) {
      score += Math.max(0, 30 - (min - cv.yearsOfExperience) * 5);
    } else {
      score += Math.max(0, 30 - (cv.yearsOfExperience - max) * 3);
    }
  } else {
    score += 15; // Neutral score if no experience filter
  }

  // Skills matching (up to 20 points)
  if (criteria.skills && criteria.skills.length > 0) {
    const cvSkillsLower = cv.skills.map((s) => s.toLowerCase());
    const matchedSkills = criteria.skills.filter((skill) =>
      cvSkillsLower.some((cvSkill) => cvSkill.includes(skill.toLowerCase())),
    );
    score += (matchedSkills.length / criteria.skills.length) * 20;
  } else {
    score += 10; // Neutral score if no skills filter
  }

  return Math.min(100, Math.round(score));
}
