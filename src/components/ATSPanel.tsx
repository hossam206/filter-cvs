"use client";

interface ATSPanelProps {
  atsEnabled: boolean;
  jobTitle: string;
  jobDescription: string;
  onToggle: () => void;
  onJobTitleChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
  showJobDescriptionError?: boolean;
  variant?: "sidebar" | "card" | "compact";
}

export default function ATSPanel({
  atsEnabled,
  jobTitle,
  jobDescription,
  onToggle,
  onJobTitleChange,
  onJobDescriptionChange,
  showJobDescriptionError = false,
  variant = "sidebar",
}: ATSPanelProps) {
  const isJobDescriptionMissing =
    atsEnabled && jobDescription.trim().length === 0;
  const showError = showJobDescriptionError && isJobDescriptionMissing;

  const descriptionTextarea = (
    <>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">
        Job Description <span className="text-red-400">*</span>
      </label>
      <textarea
        rows={variant === "compact" ? 3 : 6}
        placeholder="Paste the full job description here..."
        value={jobDescription}
        onChange={(e) => onJobDescriptionChange(e.target.value)}
        aria-invalid={showError}
        className={`
          w-full py-2.5 px-4 bg-gray-700/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all text-sm resize-none
          ${
            showError
              ? "border-red-500/70 focus:border-red-500 focus:ring-red-500"
              : "border-gray-600 focus:border-purple-500 focus:ring-purple-500"
          }
        `}
      />
      {showError && (
        <p className="mt-1.5 text-xs text-red-400">
          Job description is required when ATS matching is enabled.
        </p>
      )}
    </>
  );

  if (variant === "compact") {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Job Title (e.g. Senior Frontend Engineer)"
              value={jobTitle}
              onChange={(e) => onJobTitleChange(e.target.value)}
              className="w-full py-2.5 px-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
            />
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={atsEnabled}
            onClick={onToggle}
            className={`
              shrink-0 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all cursor-pointer
              ${
                atsEnabled
                  ? "border-purple-500 bg-purple-500/10 text-white"
                  : "border-gray-600 bg-gray-700/30 text-gray-400 hover:text-white hover:border-gray-500"
              }
            `}
          >
            <span
              className={`
                relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200
                ${atsEnabled ? "bg-purple-600" : "bg-gray-600"}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
                  ${atsEnabled ? "translate-x-[18px]" : "translate-x-0.5"}
                `}
              />
            </span>
            ATS Match
          </button>
        </div>
        {!atsEnabled && (
          <p className="mt-2 text-xs text-gray-500">
            Match score uses the job title above. Toggle ATS to score against a
            full job description.
          </p>
        )}
        {atsEnabled && (
          <div className="mt-3 pt-3 border-t border-gray-700/60">
            {descriptionTextarea}
          </div>
        )}
      </div>
    );
  }

  const wrapperClass =
    variant === "card"
      ? "bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6"
      : "";

  return (
    <div className={wrapperClass}>
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-400 mb-1.5">
          Job Title
        </label>
        <input
          type="text"
          placeholder="e.g. Senior Frontend Engineer"
          value={jobTitle}
          onChange={(e) => onJobTitleChange(e.target.value)}
          className="w-full py-2.5 px-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
        />
        {!atsEnabled && (
          <p className="mt-1.5 text-xs text-gray-500">
            Match score is calculated against this job title.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div>
          <label className="block text-sm font-medium text-white">
            Match against ATS
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            Score against the full job description
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={atsEnabled}
          onClick={onToggle}
          className={`
            relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
            ${atsEnabled ? "bg-purple-600" : "bg-gray-600"}
          `}
        >
          <span
            className={`
              inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200
              ${atsEnabled ? "translate-x-5" : "translate-x-0.5"}
            `}
          />
        </button>
      </div>

      {atsEnabled && (
        <div className="space-y-3 mt-3">
          <div>{descriptionTextarea}</div>
        </div>
      )}
    </div>
  );
}
