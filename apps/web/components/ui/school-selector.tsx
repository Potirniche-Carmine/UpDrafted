"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface School {
  id: number;
  name: string;
  classification: 'high_school' | 'college' | 'university' | 'professional' | 'other';
}

interface SchoolSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  labelClassName?: string;
  description?: string;
  height?: string;
  educationLevel?: 'high_school' | 'undergraduate' | 'graduate' | 'associate';
  onError?: (error: string | null) => void; // New prop for error handling
}

// Map education level to school classification
const getSchoolClassification = (educationLevel?: string): 'high_school' | 'college' | 'university' | 'professional' | 'other' => {
  switch (educationLevel) {
    case 'high_school':
      return 'high_school';
    case 'associate':
      return 'college';
    case 'undergraduate':
    case 'graduate':
      return 'university';
    default:
      return 'university'; // Default fallback
  }
};

export function SchoolSelector({
  value,
  onValueChange,
  placeholder = "Start typing school name...",
  label = "School",
  required = false,
  disabled = false,
  labelClassName = "text-sm font-medium",
  description,
  height = "!h-11",
  educationLevel,
  onError,
}: SchoolSelectorProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<School[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Track if the user has started typing (to avoid API calls on initial load)
  const [hasUserStartedTyping, setHasUserStartedTyping] = useState(false);

  // Search schools when input value changes
  useEffect(() => {
    if (inputValue.length < 2 || !hasUserStartedTyping) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchSchools = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const classification = getSchoolClassification(educationLevel);
        const params = new URLSearchParams({
          q: inputValue,
          limit: '8',
          ...(classification !== 'university' && { classification })
        });
        
        const response = await fetch(`/api/schools?${params}`);
        if (response.ok) {
          const results = await response.json();
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
          setSelectedIndex(-1);
        } else {
          const errorData = await response.json();
          const errorMsg = errorData.error || 'Failed to search schools. Please try again.';
          setErrorMessage(errorMsg);
          setSuggestions([]);
          setShowSuggestions(false);
          onError?.(errorMsg);
        }
      } catch (error) {
        console.error('Error searching schools:', error);
        const errorMsg = 'Network error. Please check your connection and try again.';
        setErrorMessage(errorMsg);
        setSuggestions([]);
        setShowSuggestions(false);
        onError?.(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchSchools, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue, educationLevel, onError, hasUserStartedTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHasUserStartedTyping(true); // Mark that user has started typing
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage(null);
      onError?.(null);
    }
    // Don't call onValueChange here, wait for selection or blur
  };

  const handleSelectSuggestion = (school: School) => {
    setIsSelectingSuggestion(true);
    setInputValue(school.name);
    onValueChange(school.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    // Reset flag after a short delay
    setTimeout(() => setIsSelectingSuggestion(false), 100);
  };

  const handleInputBlur = () => {
    // Don't process blur if we're in the middle of selecting a suggestion
    if (isSelectingSuggestion) {
      return;
    }
    
    // Small delay to allow for suggestion click
    setTimeout(() => {
      if (inputValue.trim() && inputValue !== value && !isSelectingSuggestion) {
        // Check if the typed value matches any existing school
        const exactMatch = suggestions.find(
          school => school.name.toLowerCase() === inputValue.toLowerCase()
        );

        if (exactMatch) {
          // Use existing school name
          onValueChange(exactMatch.name);
        } else {
          // Just use the typed value - don't create in database yet
          onValueChange(inputValue.trim());
        }
      } else if (!inputValue.trim() && value) {
        // If user clears the field, revert to the previous value
        setInputValue(value);
      }
      setShowSuggestions(false);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else {
        // Trigger blur logic to save the typed value (only if not selecting)
        if (!isSelectingSuggestion) {
          inputRef.current?.blur();
        }
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="relative space-y-2">
      {label && (
        <Label htmlFor="school" className={labelClassName}>
          {label} {required && '*'}
        </Label>
      )}
      
      <div className="relative">
        <div className="relative py-1">
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-50" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(height, "pl-10 bg-background")}
            autoComplete="off"
            required={required}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map((school, index) => (
              <div
                key={school.id}
                className={cn(
                  "px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                  selectedIndex === index && "bg-accent text-accent-foreground"
                )}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur
                  handleSelectSuggestion(school);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 opacity-0" />
                  <div className="flex flex-col">
                    <span className="text-sm">{school.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {school.classification.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <p className="text-sm text-red-500 mt-1">
          {errorMessage}
        </p>
      )}
      
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
