"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { AdvancedFilters } from './advanced-filters';
import { MultiSelectFilter, type FilterOption } from './filter-components';
import { SportFilter } from '@/components/ui/sport-filter';

interface SearchFiltersProps {
  // State
  effectiveRole: string;
  showMobileFilters: boolean;
  setShowMobileFilters: (show: boolean) => void;
  activeFiltersCount: number;
  showDiscoverButton: boolean;

  // Filter values
  selectedSports: FilterOption[];
  selectedDivisions: FilterOption[];
  selectedCountries: FilterOption[];
  selectedStates: FilterOption[];
  selectedPositions: FilterOption[];
  selectedGraduatingClasses: FilterOption[];
  selectedConferences: FilterOption[];
  minHeight: number;
  minWeight: number;
  verifiedFilter: boolean | null;
  showStatesFilter: boolean;

  // Filter options
  divisionsOptions: FilterOption[];
  countryOptions: FilterOption[];
  statesOptions: FilterOption[];
  graduatingClassOptions: FilterOption[];
  positionsOptions: FilterOption[];
  conferencesOptions: FilterOption[];

  // Setters
  setSelectedSports: (sports: FilterOption[]) => void;
  setSelectedDivisions: (divisions: FilterOption[]) => void;
  setSelectedCountries: (countries: FilterOption[]) => void;
  setSelectedStates: (states: FilterOption[]) => void;
  setSelectedPositions: (positions: FilterOption[]) => void;
  setSelectedGraduatingClasses: (classes: FilterOption[]) => void;
  setSelectedConferences: (conferences: FilterOption[]) => void;
  setMinHeight: (height: number) => void;
  setMinWeight: (weight: number) => void;
  setVerifiedFilter: (verified: boolean | null) => void;

  // Feature access
  hasAdvancedSearch: boolean;

  // Actions
  handleDiscover: () => void;
  clearFilters: () => void;
  handleUpgradeClick: () => void;

  // Title and subtitle
  title: string;
  subtitle: string;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  effectiveRole,
  showMobileFilters,
  setShowMobileFilters,
  activeFiltersCount,
  showDiscoverButton,
  selectedSports,
  selectedDivisions,
  selectedCountries,
  selectedStates,
  selectedPositions,
  selectedGraduatingClasses,
  selectedConferences,
  minHeight,
  minWeight,
  verifiedFilter,
  showStatesFilter,
  divisionsOptions,
  countryOptions,
  statesOptions,
  graduatingClassOptions,
  positionsOptions,
  conferencesOptions,
  setSelectedSports,
  setSelectedDivisions,
  setSelectedCountries,
  setSelectedStates,
  setSelectedPositions,
  setSelectedGraduatingClasses,
  setSelectedConferences,
  setMinHeight,
  setMinWeight,
  setVerifiedFilter,
  hasAdvancedSearch,
  handleDiscover,
  clearFilters,
  handleUpgradeClick,
  title,
  subtitle
}) => {
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Clear filters function (default sport handling is done elsewhere)
  const handleClearFilters = () => {
    clearFilters();
  };

  // Handle scroll event to show/hide scroll hint
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
    setShowScrollHint(!isAtBottom);
  };

  // Set up scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Initial check
    handleScroll();

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const renderFiltersContent = () => (
    <div className="space-y-3 sm:space-y-4">
      {/* Sports Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">
          Sports
        </label>
        <SportFilter
          selected={selectedSports}
          onSelectionChange={setSelectedSports}
          placeholder="Select sports..."
          searchPlaceholder="Search sports..."
        />
      </div>

      {/* Divisions Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">
          Division/Level
        </label>
        <MultiSelectFilter
          options={divisionsOptions}
          selected={selectedDivisions}
          onSelectionChange={setSelectedDivisions}
          placeholder="Select divisions..."
          searchPlaceholder="Search divisions..."
        />
      </div>

      {/* Country Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">
          Country
        </label>
        <MultiSelectFilter
          options={countryOptions}
          selected={selectedCountries}
          onSelectionChange={setSelectedCountries}
          placeholder="Select countries..."
          searchPlaceholder="Search countries..."
        />
      </div>

      {/* States Filter - Only show if United States is selected */}
      {showStatesFilter && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            US States
          </label>
          <MultiSelectFilter
            options={statesOptions}
            selected={selectedStates}
            onSelectionChange={setSelectedStates}
            placeholder="Select states..."
            searchPlaceholder="Search states..."
          />
        </div>
      )}

      {/* Advanced Filters Component */}
      <AdvancedFilters
        effectiveRole={effectiveRole}
        hasAdvancedSearch={hasAdvancedSearch}
        graduatingClassOptions={graduatingClassOptions}
        positionsOptions={positionsOptions}
        conferencesOptions={conferencesOptions}
        selectedGraduatingClasses={selectedGraduatingClasses}
        selectedPositions={selectedPositions}
        selectedConferences={selectedConferences}
        selectedSports={selectedSports}
        selectedDivisions={selectedDivisions}
        minHeight={minHeight}
        minWeight={minWeight}
        verifiedFilter={verifiedFilter}
        setSelectedGraduatingClasses={setSelectedGraduatingClasses}
        setSelectedPositions={setSelectedPositions}
        setSelectedConferences={setSelectedConferences}
        setMinHeight={setMinHeight}
        setMinWeight={setMinWeight}
        setVerifiedFilter={setVerifiedFilter}
        handleUpgradeClick={handleUpgradeClick}
      />
    </div>
  );

  return (
    <>
      {/* Desktop Filters Sidebar */}
      <div className="hidden xl:block w-full xl:w-80 flex-shrink-0">
        <div className="bg-white dark:bg-black rounded-2xl border border-[#01ae79]/20 dark:border-[#01ae79]/25 sticky top-6 h-[calc(95vh-3rem)] max-h-[734px] overflow-hidden flex flex-col">
          {/* Header Section - Fixed */}
          <div className="px-6 py-5 border-b border-[#01ae79]/20 dark:border-[#01ae79]/25 flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                Filters
              </h3>
              {activeFiltersCount > 0 && (
                <span className="text-xs font-medium text-[#01ae79]">
                  {activeFiltersCount} applied
                </span>
              )}
            </div>
          </div>

          {/* Scrollable Filters Content */}
          <div className="flex-1 relative overflow-hidden">
            {/* Scrollable content */}
            <div
              ref={scrollContainerRef}
              className="h-full overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
            >
              <div className="space-y-3 sm:space-y-4 pb-4">
                {/* Sports Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Sports
                  </label>
                  <SportFilter
                    selected={selectedSports}
                    onSelectionChange={setSelectedSports}
                    placeholder="Select sports..."
                    searchPlaceholder="Search sports..."
                  />
                </div>

                {/* Divisions Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Division/Level
                  </label>
                  <MultiSelectFilter
                    options={divisionsOptions}
                    selected={selectedDivisions}
                    onSelectionChange={setSelectedDivisions}
                    placeholder="Select divisions..."
                    searchPlaceholder="Search divisions..."
                  />
                </div>

                {/* Country Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-foreground">
                    Country
                  </label>
                  <MultiSelectFilter
                    options={countryOptions}
                    selected={selectedCountries}
                    onSelectionChange={setSelectedCountries}
                    placeholder="Select countries..."
                    searchPlaceholder="Search countries..."
                  />
                </div>

                {/* States Filter - Only show if United States is selected */}
                {showStatesFilter && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-foreground">
                      US States
                    </label>
                    <MultiSelectFilter
                      options={statesOptions}
                      selected={selectedStates}
                      onSelectionChange={setSelectedStates}
                      placeholder="Select states..."
                      searchPlaceholder="Search states..."
                    />
                  </div>
                )}

                {/* Advanced Filters Component */}
                <AdvancedFilters
                  effectiveRole={effectiveRole}
                  hasAdvancedSearch={hasAdvancedSearch}
                  graduatingClassOptions={graduatingClassOptions}
                  positionsOptions={positionsOptions}
                  conferencesOptions={conferencesOptions}
                  selectedGraduatingClasses={selectedGraduatingClasses}
                  selectedPositions={selectedPositions}
                  selectedConferences={selectedConferences}
                  selectedSports={selectedSports}
                  selectedDivisions={selectedDivisions}
                  minHeight={minHeight}
                  minWeight={minWeight}
                  verifiedFilter={verifiedFilter}
                  setSelectedGraduatingClasses={setSelectedGraduatingClasses}
                  setSelectedPositions={setSelectedPositions}
                  setSelectedConferences={setSelectedConferences}
                  setMinHeight={setMinHeight}
                  setMinWeight={setMinWeight}
                  setVerifiedFilter={setVerifiedFilter}
                  handleUpgradeClick={handleUpgradeClick}
                />
              </div>
            </div>
            
            {/* Scroll indicator hint - only show when not at bottom */}
            {showScrollHint && (
              <div className="absolute bottom-2 right-6 text-xs text-muted-foreground/60 pointer-events-none">
                Scroll for more
              </div>
            )}
          </div>

          {/* Fixed Action Buttons */}
          {showDiscoverButton && (
            <div className="flex gap-3 p-6 pt-4 border-t border-[#01ae79]/20 dark:border-[#01ae79]/25 flex-shrink-0">
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="flex-1"
                disabled={activeFiltersCount === 0}
              >
                Clear All
              </Button>
              <Button
                onClick={handleDiscover}
                className="flex-1 bg-[#01ae79] hover:bg-[#018a60] text-white"
              >
                <Search className="h-4 w-4 mr-1" />
                Apply
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Filters Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] xl:hidden flex items-start sm:items-center justify-center p-4 pt-20 sm:pt-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white dark:bg-black rounded-2xl border border-[#01ae79]/20 dark:border-[#01ae79]/25 max-h-[calc(100dvh-6rem)] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-[#01ae79]/10">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#01ae79]/20 dark:border-[#01ae79]/25">
              <h2 className="text-lg font-bold text-foreground">Filters</h2>
              <Button
                onClick={() => setShowMobileFilters(false)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {renderFiltersContent()}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 p-6 pt-4 border-t border-[#01ae79]/20 dark:border-[#01ae79]/25">
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="flex-1"
                disabled={activeFiltersCount === 0}
              >
                Clear all
              </Button>
              {showDiscoverButton && (
                <Button
                  onClick={handleDiscover}
                  className="flex-1 bg-[#01ae79] hover:bg-[#018a60] text-white"
                >
                  <Search className="h-4 w-4 mr-1" />
                  Apply
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};