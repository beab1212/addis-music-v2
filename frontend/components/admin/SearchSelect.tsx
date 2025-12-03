'use client';

import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

export default function SearchSelect({
  label,
  query,
  setQuery,
  options = [],                // ← default to empty array
  onSelect,
  selected,
  fieldName,
  placeholder = "Search...",
  className = "",
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Safely convert options to array + filter
  const safeOptions = Array.isArray(options) ? options : [];
  
  const filteredOptions = safeOptions.filter((opt) =>
    opt[fieldName]?.toString().toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (opt: any) => {
    onSelect(opt);
    setQuery(opt[fieldName]?.toString() || "");
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery("");
    inputRef.current?.focus();
  };

  const displayValue = selected ? selected[fieldName] : query;

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <div
        className={`
          relative flex items-center w-full px-3 py-2 
          border rounded-lg shadow-sm bg-white dark:bg-[#0b0b0d]
          border-gray-300 dark:border-gray-700
          focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500
          transition-all ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}
        `}
        onClick={() => setIsOpen(true)}
      >
        <input
          ref={inputRef}
          type="text"
          value={displayValue ?? ""}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={selected ? "" : placeholder}
          className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
        />

        {selected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="ml-2 text-gray-400 pointer-events-none">
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {query ? "No results found" : "Start typing to search"}
            </div>
          ) : (
            <ul>
              {filteredOptions.map((opt) => (
                <li
                  key={opt.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt);
                  }}
                  className={`
                    px-4 py-2 cursor-pointer text-sm
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${selected?.id === opt.id 
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                      : "text-gray-900 dark:text-gray-100"}
                  `}
                >
                  {opt[fieldName]}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}