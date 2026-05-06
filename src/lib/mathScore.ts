import { CVData } from "@/types/cv";

const ATS_STOPWORDS = new Set([
  "the", "and", "for", "with", "you", "are", "our", "will", "this", "that",
  "have", "has", "your", "from", "any", "all", "into", "but", "not", "who",
  "out", "use", "can", "may", "per", "via", "etc", "such", "must", "should",
  "their", "them", "they", "than", "then", "also", "other", "more", "less",
  "able", "ability", "team", "role", "work", "working", "responsibilities",
  "requirements", "preferred", "qualifications", "about", "looking",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter((t) => t.length >= 3 && !ATS_STOPWORDS.has(t));
}

export function calculateATSScore(
  cv: CVData,
  jobTitle: string,
  jobDescription: string,
): number {
  const titleText = (jobTitle ?? "").trim();
  const descText = (jobDescription ?? "").trim();
  if (!titleText && !descText) return 0;

  const titleTokens = new Set(tokenize(titleText));
  const descTokens = new Set(tokenize(descText));

  const weights = new Map<string, number>();
  for (const tok of descTokens) weights.set(tok, 1);
  for (const tok of titleTokens) weights.set(tok, (weights.get(tok) ?? 0) + 3);
  if (weights.size === 0) return 0;

  const cvSkillsLower = cv.skills.map((s) => s.toLowerCase());
  const cvCorpusParts: string[] = [
    cv.skills.join(" "),
    cv.summary ?? "",
    ...cv.companies.flatMap((c) => [
      c.position ?? "",
      c.name ?? "",
      ...(c.achievements ?? []),
    ]),
    cv.rawText ?? "",
  ];
  const cvCorpus = cvCorpusParts.join(" ").toLowerCase();

  let totalWeight = 0;
  let matchedWeight = 0;
  for (const [tok, weight] of weights) {
    const skillBonus = cvSkillsLower.some((s) => s.includes(tok)) ? 1 : 0;
    const effectiveWeight = weight + skillBonus;
    totalWeight += effectiveWeight;
    if (cvCorpus.includes(tok)) {
      matchedWeight += effectiveWeight;
    }
  }

  if (totalWeight === 0) return 0;
  const pct = Math.round((matchedWeight / totalWeight) * 100);
  return Math.max(0, Math.min(100, pct));
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
