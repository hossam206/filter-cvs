/**
 * Extracts the number of years from a duration string
 * Handles various formats like:
 * - "2 years"
 * - "3.5 years"
 * - "Jan 2020 - Dec 2022"
 * - "2020-2022"
 * - "6 months"
 * - "Jan 2020 - Present"
 * - "2020 - Current"
 */
export function calculateYearsFromDuration(duration: string): number {
  if (!duration || duration === "N/A") {
    return 0;
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11

  // Try to extract explicit year mentions like "2 years", "3.5 years"
  const yearsMatch = duration.match(/(\d+(?:\.\d+)?)\s*(?:year|yr)/i);
  if (yearsMatch) {
    return parseFloat(yearsMatch[1]);
  }

  // Try to extract months like "6 months", "18 months"
  const monthsMatch = duration.match(/(\d+)\s*(?:month|mo)/i);
  if (monthsMatch) {
    return Math.round((parseInt(monthsMatch[1]) / 12) * 10) / 10; // Round to 1 decimal
  }

  // Check for "Present" or "Current" (case-insensitive)
  const hasPresentOrCurrent = /present|current|now/i.test(duration);

  if (hasPresentOrCurrent) {
    // Try to extract start date with month (e.g., "Jan 2020 - Present")
    const startDateMatch = duration.match(/([A-Za-z]+)\s*(\d{4})\s*[-–—]/i);
    if (startDateMatch) {
      const startYear = parseInt(startDateMatch[2]);
      const months = [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
      ];
      const startMonth = months.indexOf(
        startDateMatch[1].toLowerCase().substring(0, 3),
      );

      if (startMonth !== -1) {
        const yearDiff = currentYear - startYear;
        const monthDiff = (currentMonth - startMonth) / 12;
        return Math.max(0, Math.round((yearDiff + monthDiff) * 10) / 10);
      }

      // If we can't parse the month, just use years
      return Math.max(0, currentYear - startYear);
    }

    // Try to extract just year (e.g., "2020 - Present")
    const startYearMatch = duration.match(/(\d{4})\s*[-–—]/);
    if (startYearMatch) {
      const startYear = parseInt(startYearMatch[1]);
      return Math.max(0, currentYear - startYear);
    }
  }

  // Try to extract numeric date ranges (e.g., "07/2024 - 06/2025" or "07/2024 – 06/2025")
  const numericDateMatch = duration.match(
    /(\d{1,2})\s*\/\s*(\d{4})\s*[-–—]\s*(\d{1,2})\s*\/\s*(\d{4})/,
  );
  if (numericDateMatch) {
    const startMonth = parseInt(numericDateMatch[1]);
    const startYear = parseInt(numericDateMatch[2]);
    const endMonth = parseInt(numericDateMatch[3]);
    const endYear = parseInt(numericDateMatch[4]);

    // Calculate total months
    const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth);
    // Return as a decimal (will be formatted later)
    return Math.max(0, totalMonths / 12);
  }

  // Try to extract year ranges like "2020-2022" or "Jan 2020 - Dec 2022"
  const yearRangeMatch = duration.match(
    /(?:^|\D)(\d{4})\s*[-–—]\s*(\d{4})(?:\D|$)/,
  );
  if (yearRangeMatch) {
    const startYear = parseInt(yearRangeMatch[1]);
    const endYear = parseInt(yearRangeMatch[2]);
    return Math.max(0, endYear - startYear);
  }

  // Try to extract date ranges with months (e.g., "Jan 2020 - Dec 2022")
  const dateRangeMatch = duration.match(
    /([A-Za-z]+)\s*(\d{4})\s*[-–—]\s*([A-Za-z]+)\s*(\d{4})/i,
  );
  if (dateRangeMatch) {
    const startYear = parseInt(dateRangeMatch[2]);
    const endYear = parseInt(dateRangeMatch[4]);
    const yearDiff = endYear - startYear;

    // Add partial year based on months (rough estimate)
    const months = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const startMonth = months.indexOf(
      dateRangeMatch[1].toLowerCase().substring(0, 3),
    );
    const endMonth = months.indexOf(
      dateRangeMatch[3].toLowerCase().substring(0, 3),
    );

    if (startMonth !== -1 && endMonth !== -1) {
      const monthDiff = (endMonth - startMonth) / 12;
      return Math.round((yearDiff + monthDiff) * 10) / 10; // Round to 1 decimal
    }

    return yearDiff;
  }

  // If no pattern matches, return 0
  return 0;
}

export function formatYears(years: number): string {
  if (years === 0) {
    return "N/A";
  }

  // Convert to months for display
  const totalMonths = Math.round(years * 12);

  // If less than 12 months, show in months
  if (totalMonths < 12) {
    return `${totalMonths} month`;
  }

  // Otherwise show in years
  const wholeYears = Math.floor(years);
  return `${wholeYears} year`;
}
