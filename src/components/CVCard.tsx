"use client";

import { CVData } from "@/types/cv";
import {
  calculateYearsFromDuration,
  formatYears,
} from "@/lib/calculate-company-years";

interface CVCardProps {
  cv: CVData;
  rank: number;
}

export default function CVCard({ cv, rank }: CVCardProps) {
  const companies = cv.companies;

  const getScoreColor = (score?: number) => {
    if (!score) return "from-gray-500 to-gray-600";
    if (score >= 80) return "from-emerald-500 to-green-600";
    if (score >= 60) return "from-blue-500 to-purple-600";
    if (score >= 40) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-pink-600";
  };

  const getExperienceBadgeColor = (years: number) => {
    if (years >= 10)
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    if (years >= 5) return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    if (years >= 2) return "bg-green-500/20 text-green-300 border-green-500/30";
    return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  return (
    <div className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
      {/* Rank Badge */}
      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
        #{rank}
      </div>

      {/* Match Score */}
      {cv.matchScore !== undefined && (
        <div className="absolute -top-3 -right-3">
          <div
            className={`
            px-3 py-1 rounded-full text-xs font-bold text-white
            bg-gradient-to-r ${getScoreColor(cv.matchScore)}
            shadow-lg
          `}
          >
            {cv.matchScore}% Match
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
          {cv.name}
        </h3>
        <div className="flex items-center space-x-3">
          <span
            className={`
            px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2
            ${getExperienceBadgeColor(cv.yearsOfExperience)}
          `}
          >
            <span className="text-sm  ">{`( ${cv.yearsOfExperience} )`}</span>
            years Experience
          </span>
          {/* <span className="text-xs text-gray-500">{cv.fileName}</span> */}
        </div>
      </div>

      {/* Summary */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{cv.summary}</p>

      {/* Companies */}
      {companies.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Work Experience
          </h4>
          <div className="space-y-2">
            {companies.map((company, index) => {
              // Check if this is a current/present job
              const isCurrentJob = /present|current|now/i.test(
                company.duration,
              );

              const years = calculateYearsFromDuration(company.duration);
              const yearsDisplay = isCurrentJob
                ? "Present"
                : formatYears(years);

              return (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-xl bg-gray-700/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {company.position}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-400">{company.name}</p>
                      <span
                        className={`text-sm font-semibold whitespace-nowrap ${isCurrentJob ? "text-green-400" : "text-purple-400"}`}
                      >
                        {yearsDisplay}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{company.duration}</p>

                    {/* Achievements */}
                    {company.achievements && company.achievements.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {company.achievements.map((achievement, achIndex) => (
                          <div
                            key={achIndex}
                            className="flex items-start space-x-1.5"
                          >
                            <span className="text-purple-400 text-xs mt-0.5">•</span>
                            <p className="text-xs text-gray-300 leading-relaxed">
                              {achievement}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skills */}
      {cv.skills.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.slice(0, 6).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-md text-xs bg-gray-700/50 text-gray-300"
              >
                {skill}
              </span>
            ))}
            {cv.skills.length > 6 && (
              <span className="px-2 py-1 rounded-md text-xs bg-gray-700/50 text-gray-400">
                +{cv.skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Contact Info */}
      {(cv.email || cv.phone) && (
        <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center space-x-4 text-xs text-gray-500">
          {cv.email && (
            <span className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <a
                href={`mailto:${cv.email}`}
                className="truncate max-w-[150px] hover:text-sky-600 hover:underline"
              >
                {cv.email}
              </a>
            </span>
          )}
          {cv.phone && (
            <span className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <a
                href={`tel:${cv.phone}`}
                className="truncate max-w-[150px] hover:underline hover:text-sky-600"
              >
                {cv.phone}
              </a>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
