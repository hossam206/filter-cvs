export interface Company {
  name: string;
  position: string;
  duration: string;
  achievements?: string[];
}

export interface CVData {
  id: string;
  fileName: string;
  name: string;
  email?: string;
  phone?: string;
  yearsOfExperience: number;
  skills: string[];
  companies: Company[];
  summary: string;
  matchScore?: number;
  rawText?: string;
  originalFile?: string; // base64 encoded original file
  fileType?: string; // MIME type of original file
}

export interface FilterCriteria {
  minExperience: number;
  maxExperience: number;
  skills: string[];
  searchQuery: string;
}

export interface ParsedCVResponse {
  success: boolean;
  data?: CVData;
  error?: string;
}
