"use client";

import { CVData } from "@/types/cv";
import CVCard from "./CVCard";

interface CVGridProps {
    cvs: CVData[];
    isLoading: boolean;
}

export default function CVGrid({ cvs, isLoading }: CVGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, index) => (
                    <div
                        key={index}
                        className="animate-pulse bg-gray-800/50 rounded-2xl border border-gray-700 p-6"
                    >
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gray-700" />
                            <div className="flex-1">
                                <div className="h-5 bg-gray-700 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-700 rounded w-1/2" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-700 rounded" />
                            <div className="h-3 bg-gray-700 rounded w-5/6" />
                            <div className="h-3 bg-gray-700 rounded w-4/6" />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <div className="h-6 w-16 bg-gray-700 rounded-full" />
                            <div className="h-6 w-20 bg-gray-700 rounded-full" />
                            <div className="h-6 w-14 bg-gray-700 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (cvs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 rounded-full bg-gray-800/50 flex items-center justify-center mb-6">
                    <svg
                        className="w-12 h-12 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    No CVs Found
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                    Upload some CV files to get started, or adjust your filters to see
                    more results.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cvs.map((cv, index) => (
                <CVCard key={cv.id} cv={cv} rank={index + 1} />
            ))}
        </div>
    );
}
