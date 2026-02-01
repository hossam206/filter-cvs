"use client";

import { useState, useMemo, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import FilterPanel from "@/components/FilterPanel";
import CVGrid from "@/components/CVGrid";
import { CVData, FilterCriteria } from "@/types/cv";
import { calculateMatchScore } from "@/lib/mathScore";

export default function Home() {
  const [cvs, setCvs] = useState<CVData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [filters, setFilters] = useState<FilterCriteria>({
    minExperience: 0,
    maxExperience: 50,
    skills: [],
    searchQuery: "",
  });

  const handleFilesSelected = useCallback(async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    setProcessingStatus(`Processing ${files.length} files...`);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      });
      console.log("response is", response);
      if (!response.ok) {
        const text = await response.text();
        console.error("API Error Response:", text);
        throw new Error(
          `Failed to process CVs: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();
      console.log("result", result);
      if (result.data && result.data.length > 0) {
        setCvs(result.data);
        setProcessingStatus(
          `Successfully processed ${result.processedCount} of ${result.totalCount} files`,
        );
      } else {
        if (result.errors && result.errors.length > 0) {
          setError(
            result.errors
              .map((e: any) => `${e.fileName}: ${e.error}`)
              .join("\n"),
          );
        } else {
          setError("No valid CVs could be processed");
        }
      }

      if (result.errors && result.errors.length > 0) {
        console.warn("Some files had errors:", result.errors);
      }
    } catch (err) {
      console.error("Error processing CVs:", err);
      setError(err instanceof Error ? err.message : "Failed to process CVs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Extract all unique skills from CVs
  const availableSkills = useMemo(() => {
    const skillSet = new Set<string>();
    cvs.forEach((cv) => {
      cv.skills.forEach((skill) => skillSet.add(skill));
    });
    return Array.from(skillSet).sort();
  }, [cvs]);

  // Filter and sort CVs
  const filteredAndSortedCvs = useMemo(() => {
    let filtered = cvs;

    // Apply experience filter
    if (filters.minExperience > 0 || filters.maxExperience < 50) {
      filtered = filtered.filter(
        (cv) =>
          cv.yearsOfExperience >= filters.minExperience &&
          cv.yearsOfExperience <= filters.maxExperience,
      );
    }

    // Apply skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter((cv) => {
        const cvSkillsLower = cv.skills.map((s) => s.toLowerCase());
        return filters.skills.some((skill) =>
          cvSkillsLower.some((cvSkill) =>
            cvSkill.includes(skill.toLowerCase()),
          ),
        );
      });
    }

    // Apply search filter
    if (filters.searchQuery.length > 0) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cv) =>
          cv.name.toLowerCase().includes(query) ||
          cv.summary.toLowerCase().includes(query) ||
          cv.skills.some((s) => s.toLowerCase().includes(query)) ||
          cv.companies.some(
            (c) =>
              c.name.toLowerCase().includes(query) ||
              c.position.toLowerCase().includes(query),
          ),
      );
    }

    // Calculate match scores and sort
    const withScores = filtered.map((cv) => ({
      ...cv,
      matchScore: calculateMatchScore(cv, {
        minExperience: filters.minExperience,
        maxExperience: filters.maxExperience,
        skills: filters.skills,
      }),
    }));

    // Sort by match score (highest first)
    return withScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [cvs, filters]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">CV Filter</h1>
                  <p className="text-xs text-gray-400">
                    AI-Powered Resume Screening
                  </p>
                </div>
              </div>
              {cvs.length > 0 && (
                <div className="text-sm text-gray-400">
                  {cvs.length} CV{cvs.length > 1 ? "s" : ""} loaded
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          {/* Hero Section - shown when no CVs */}
          {cvs.length === 0 && !isLoading && (
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Screen CVs with{" "}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  s AI hossa
                </span>
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                Upload a folder of resumes and let our AI extract, analyze, and
                rank candidates based on your criteria. Find the perfect match
                in seconds.
              </p>
            </div>
          )}

          {/* Upload Section */}
          {cvs.length === 0 && (
            <div className="max-w-2xl mx-auto mb-12">
              <FileUpload
                onFilesSelected={handleFilesSelected}
                isLoading={isLoading}
              />
              {processingStatus && !error && (
                <p className="text-center text-sm text-gray-400 mt-4">
                  {processingStatus}
                </p>
              )}
              {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Main Content - shown when CVs are loaded */}
          {cvs.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <aside className="lg:w-80 flex-shrink-0">
                <div className="lg:sticky lg:top-24">
                  <FilterPanel
                    filters={filters}
                    onFilterChange={setFilters}
                    availableSkills={availableSkills}
                    totalResults={cvs.length}
                    filteredResults={filteredAndSortedCvs.length}
                  />

                  {/* Upload more button */}
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setCvs([]);
                        setFilters({
                          minExperience: 0,
                          maxExperience: 50,
                          skills: [],
                          searchQuery: "",
                        });
                      }}
                      className="w-full py-3 px-4 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-purple-500 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <span>Upload New CVs</span>
                    </button>
                  </div>
                </div>
              </aside>

              {/* Results Grid */}
              <div className="flex-1 min-w-0">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    Candidates
                    {filteredAndSortedCvs.length !== cvs.length && (
                      <span className="text-lg text-gray-400 font-normal ml-2">
                        (filtered)
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-400">Sorted by match score</p>
                </div>
                <CVGrid cvs={filteredAndSortedCvs} isLoading={isLoading} />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
