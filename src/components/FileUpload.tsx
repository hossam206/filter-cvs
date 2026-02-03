"use client";

import { useCallback, useState } from "react";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  isLoading: boolean;
  setFiles: (files: File[]) => void;
}

export default function FileUpload({
  onFilesSelected,
  isLoading,
  setFiles,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadMode, setUploadMode] = useState<"files" | "folder">("files");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback((items: DataTransferItemList | FileList) => {
    const files: File[] = [];

    const processItem = async (item: DataTransferItem | File) => {
      if (item instanceof File) {
        if (isValidFile(item.name)) {
          files.push(item);
        }
      } else if (item.kind === "file") {
        const entry = item.webkitGetAsEntry?.();
        if (entry) {
          await traverseEntry(entry, files);
        } else {
          const file = item.getAsFile();
          if (file && isValidFile(file.name)) {
            files.push(file);
          }
        }
      }
    };

    const traverseEntry = async (
      entry: FileSystemEntry,
      files: File[],
    ): Promise<void> => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        return new Promise((resolve) => {
          fileEntry.file((file) => {
            if (isValidFile(file.name)) {
              files.push(file);
            }
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const reader = dirEntry.createReader();
        return new Promise((resolve) => {
          reader.readEntries(async (entries) => {
            for (const e of entries) {
              await traverseEntry(e, files);
            }
            resolve();
          });
        });
      }
    };

    return new Promise<File[]>(async (resolve) => {
      if (items instanceof FileList) {
        for (let i = 0; i < items.length; i++) {
          await processItem(items[i]);
        }
      } else {
        for (let i = 0; i < items.length; i++) {
          await processItem(items[i]);
        }
      }
      resolve(files);
    });
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = await processFiles(e.dataTransfer.items);
      if (files.length > 0) {
        setSelectedFiles(files);
      }
    },
    [processFiles],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = await processFiles(e.target.files);
        if (files.length > 0) {
          setFiles(files);
          setSelectedFiles(files);
        }
      }
    },
    [processFiles],
  );

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
  };

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  const isValidFile = (fileName: string): boolean => {
    const validExtensions = ["pdf", "docx", "doc", "txt"];
    const extension = fileName.toLowerCase().split(".").pop() || "";
    return validExtensions.includes(extension);
  };

  return (
    <div className="w-full">
      {/* Mode Toggle */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-lg bg-gray-800/50 p-1 border border-gray-700">
          <button
            onClick={() => setUploadMode("files")}
            className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-all ${
              uploadMode === "files"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Select Files
          </button>
          <button
            onClick={() => setUploadMode("folder")}
            className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-all ${
              uploadMode === "folder"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Select Folder
          </button>
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12
          transition-all duration-300 ease-out
          ${
            isDragging
              ? "border-purple-500 bg-purple-500/10 scale-[1.02]"
              : "border-gray-600 hover:border-purple-400 hover:bg-gray-800/50"
          }
          ${isLoading ? "opacity-50 pointer-events-none" : "cursor-pointer"}
        `}
      >
        {/* File input for individual files */}
        {uploadMode === "files" && (
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.docx,.doc,.txt"
            disabled={isLoading}
          />
        )}

        {/* File input for folder */}
        {uploadMode === "folder" && (
          <input
            type="file"
            multiple
            // @ts-expect-error - webkitdirectory is not in the type definition
            webkitdirectory=""
            directory=""
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.docx,.doc,.txt"
            disabled={isLoading}
          />
        )}

        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            className={`
            w-20 h-20 rounded-full flex items-center justify-center
            transition-all duration-300
            ${isDragging ? "bg-purple-500/30" : "bg-gradient-to-br from-purple-600/20 to-blue-600/20"}
          `}
          >
            <svg
              className={`w-10 h-10 transition-transform duration-300 ${
                isDragging ? "scale-110 text-purple-400" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div className="text-center">
            <p className="text-xl font-semibold text-white mb-2">
              {uploadMode === "files"
                ? "Drag & Drop CV Files"
                : "Drag & Drop CV Folder"}
            </p>
            <p className="text-gray-400">
              {uploadMode === "files"
                ? "or click to browse for files"
                : "or click to browse for a folder"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: PDF, DOCX, DOC, TXT
            </p>
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Selected Files ({selectedFiles.length})
            </h3>
            <button
              onClick={clearFiles}
              className="cursor-pointer text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
            {selectedFiles.slice(0, 10).map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 rounded-lg bg-gray-700/30"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-300 truncate flex-1">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
            {selectedFiles.length > 10 && (
              <p className="text-sm text-gray-500 text-center">
                ... and {selectedFiles.length - 10} more files
              </p>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={isLoading}
            className={`
              w-full py-3 px-6 rounded-xl font-semibold text-white
              transition-all duration-300 cursor-pointer
              ${
                isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 hover:shadow-lg hover:shadow-purple-500/25"
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Processing CVs...</span>
              </span>
            ) : (
              `Analyze ${selectedFiles.length} CV${selectedFiles.length > 1 ? "s" : ""}`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
