export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  scoreCVsSemanticallyWithGroq,
  SemanticScoreCV,
} from "@/lib/gemini";

interface RequestBody {
  jobTitle?: string;
  jobDescription?: string;
  cvs?: SemanticScoreCV[];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const jobTitle = (body.jobTitle ?? "").trim();
    const jobDescription = (body.jobDescription ?? "").trim();
    const cvs = Array.isArray(body.cvs) ? body.cvs : [];

    if (cvs.length === 0) {
      return NextResponse.json({ scores: {} });
    }
    if (!jobTitle && !jobDescription) {
      return NextResponse.json({ scores: {} });
    }

    const scores = await scoreCVsSemanticallyWithGroq(
      jobTitle,
      jobDescription,
      cvs,
    );
    return NextResponse.json({ scores });
  } catch (err) {
    console.error("ATS scoring error:", err);
    return NextResponse.json(
      { scores: {}, error: "Failed to compute semantic scores" },
      { status: 500 },
    );
  }
}
