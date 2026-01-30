import { CVData } from "@/types/cv";

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
  if (criteria.skills?.length) {
    const cvSkillsLower = cv.skills.map((s) => s.toLowerCase());
    const matched = criteria.skills.filter((skill) =>
      cvSkillsLower.some((s) => s.includes(skill.toLowerCase())),
    );
    score += (matched.length / criteria.skills.length) * 40;
  }

  // Keyword (10%)
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
