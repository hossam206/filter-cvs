import { GoogleGenerativeAI } from "@google/generative-ai";
import { CVData, Company } from "@/types/cv";
import { v4 as uuidv4 } from "uuid";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "AIzaSyDz-4RuflqH6z8yoJqRxAsgWiwMNJCucO4",
);

// model initialized once (IMPORTANT)
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export async function parseCVWithGemini(
  textContent: string,
  fileName: string,
): Promise<CVData> {
  const prompt = `You are an expert CV/Resume parser. Analyze the following CV text and extract structured information.

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
1. For yearsOfExperience, calculate the total from work history if not explicitly stated
2. List companies in reverse chronological order (most recent first)
3. Extract all relevant technical and soft skills
4. If information is missing, use null for optional fields or reasonable defaults
5. The summary should highlight key strengths and experience areas

CV Text:
${textContent}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    } else {
      const objectMatch = text.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonStr = objectMatch[0];
      }
    }

    const parsed = JSON.parse(jsonStr);

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
