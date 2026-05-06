import "server-only";

import OpenAI from "openai";
import { CVData, Company } from "@/types/cv";
import { v4 as uuidv4 } from "uuid";

/**
 * Lazy, server-only Groq client
 */
let client: OpenAI | null = null;

function getGroqClient(): OpenAI {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing");
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  return client;
}

export async function parseCVWithGroq(
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
  "yearsOfExperience": <number>,
  "skills": ["skill1", "skill2"],
  "companies": [
    {
      "name": "Company name",
      "position": "Job title",
      "duration": "Duration worked",
      "achievements": ["achievement 1", "achievement 2", "achievement 3"]
    }
  ],
  "summary": "A brief 2-3 sentence summary"
}

Rules:
- Return ONLY valid JSON
- No markdown
- No explanations
- Do NOT invent data
- Estimate conservatively if unclear
- For each company, extract 2-5 key achievements, accomplishments, or responsibilities from the CV text
- If no achievements are mentioned for a company, use an empty array

CV TEXT:
"""
${textContent}
"""
`;

  try {
    const response = await getGroqClient().chat.completions.create({
      model: "llama-3.3-70b-versatile", // best Groq model for parsing
      temperature: 0,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim();

    if (!text) {
      throw new Error("Empty response from Groq");
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
            achievements: Array.isArray(c.achievements) ? c.achievements : [],
          }))
        : [],
      summary: parsed.summary || "No summary available",
      rawText: textContent,
    };
  } catch (error) {
    console.error("Error parsing CV with Groq:", error);
    throw new Error("Failed to parse CV content");
  }
}

export interface SemanticScoreCV {
  id: string;
  name: string;
  yearsOfExperience: number;
  summary: string;
  skills: string[];
  companies: { name: string; position: string }[];
}

export async function scoreCVsSemanticallyWithGroq(
  jobTitle: string,
  jobDescription: string,
  cvs: SemanticScoreCV[],
): Promise<Record<string, number>> {
  if (cvs.length === 0) return {};

  const cvBlock = cvs
    .map(
      (cv) =>
        `[id:${cv.id}]
Name: ${cv.name}
Years of experience: ${cv.yearsOfExperience}
Summary: ${cv.summary}
Skills: ${(cv.skills || []).join(", ")}
Experience: ${(cv.companies || [])
          .map((c) => `${c.position} @ ${c.name}`)
          .join("; ")}`,
    )
    .join("\n\n");

  const prompt = `You are an experienced technical recruiter scoring CVs against a job opening.
For EACH candidate, output a semantic match score from 0 to 100.
Consider: required skills/technologies, seniority and years of experience, domain experience, role responsibilities.
Be strict but fair. Do not reward keyword stuffing — reward actual relevance to the role.

JOB TITLE: ${jobTitle || "(not specified)"}
JOB DESCRIPTION:
${jobDescription || "(not specified)"}

CANDIDATES:
${cvBlock}

Respond with ONLY a JSON object in this exact shape:
{ "scores": { "<id>": <0-100 integer>, ... } }
Include every candidate id from above. No commentary.`;

  const groq = getGroqClient();
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);
  const scores: Record<string, number> = {};
  if (parsed.scores && typeof parsed.scores === "object") {
    for (const [id, val] of Object.entries(parsed.scores)) {
      const n = typeof val === "number" ? val : parseInt(String(val), 10);
      if (!isNaN(n)) {
        scores[id] = Math.max(0, Math.min(100, Math.round(n)));
      }
    }
  }
  return scores;
}
