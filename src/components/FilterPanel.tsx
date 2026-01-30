"use client";

import { FilterCriteria } from "@/types/cv";

interface FilterPanelProps {
    filters: FilterCriteria;
    onFilterChange: (filters: FilterCriteria) => void;
    availableSkills: string[];
    totalResults: number;
    filteredResults: number;
}

const experienceRanges = [
    { label: "All", min: 0, max: 50 },
    { label: "0-2 years", min: 0, max: 2 },
    { label: "2-5 years", min: 2, max: 5 },
    { label: "5-10 years", min: 5, max: 10 },
    { label: "10+ years", min: 10, max: 50 },
];

export default function FilterPanel({
    filters,
    onFilterChange,
    availableSkills,
    totalResults,
    filteredResults,
}: FilterPanelProps) {
    const handleExperienceChange = (min: number, max: number) => {
        onFilterChange({
            ...filters,
            minExperience: min,
            maxExperience: max,
        });
    };

    const handleSkillToggle = (skill: string) => {
        const currentSkills = filters.skills;
        const newSkills = currentSkills.includes(skill)
            ? currentSkills.filter((s) => s !== skill)
            : [...currentSkills, skill];

        onFilterChange({
            ...filters,
            skills: newSkills,
        });
    };

    const handleSearchChange = (query: string) => {
        onFilterChange({
            ...filters,
            searchQuery: query,
        });
    };

    const clearFilters = () => {
        onFilterChange({
            minExperience: 0,
            maxExperience: 50,
            skills: [],
            searchQuery: "",
        });
    };

    const hasActiveFilters =
        filters.minExperience > 0 ||
        filters.maxExperience < 50 ||
        filters.skills.length > 0 ||
        filters.searchQuery.length > 0;

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Filters</h2>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Results count */}
            <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <p className="text-sm text-gray-300">
                    Showing{" "}
                    <span className="font-bold text-white">{filteredResults}</span> of{" "}
                    <span className="font-bold text-white">{totalResults}</span> CVs
                </p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                    Search
                </label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name, skills..."
                        value={filters.searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full py-3 px-4 pl-10 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {/* Experience Filter */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-3">
                    Years of Experience
                </label>
                <div className="flex flex-wrap gap-2">
                    {experienceRanges.map((range) => {
                        const isActive =
                            filters.minExperience === range.min &&
                            filters.maxExperience === range.max;
                        return (
                            <button
                                key={range.label}
                                onClick={() => handleExperienceChange(range.min, range.max)}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                                        ? "bg-purple-600 text-white"
                                        : "bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white"
                                    }
                `}
                            >
                                {range.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Skills Filter */}
            {availableSkills.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">
                        Skills ({filters.skills.length} selected)
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                        {availableSkills.map((skill) => {
                            const isSelected = filters.skills.includes(skill);
                            return (
                                <button
                                    key={skill}
                                    onClick={() => handleSkillToggle(skill)}
                                    className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                    ${isSelected
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white"
                                        }
                  `}
                                >
                                    {skill}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
