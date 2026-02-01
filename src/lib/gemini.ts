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
      "duration": "Duration worked"
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
