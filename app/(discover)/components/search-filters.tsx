"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Search, X } from "lucide-react";
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
        <div className="bg-card rounded-xl shadow-sm border border-border sticky top-6 h-[calc(95vh-3rem)] max-h-[734px] overflow-hidden flex flex-col">
          {/* Header Section - Fixed */}
          <div className="p-6 border-b border-border bg-card rounded-t-xl flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {title}
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  {subtitle}
                </p>
              </div>

              {/* Mobile Filter Button */}
              <Button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                variant="outline"
                className="xl:hidden relative"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-[#01ae79] text-white">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>


          </div>

          {/* Scrollable Filters Content with gradient indicators */}
          <div className="flex-1 relative overflow-hidden">
            {/* Top gradient fade indicator */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none"></div>
            
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
            
            {/* Bottom gradient fade indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none"></div>
            
            {/* Scroll indicator hint - only show when not at bottom */}
            {showScrollHint && (
              <div className="absolute bottom-2 right-6 text-xs text-muted-foreground/60 pointer-events-none">
                ⤓ Scroll for more
              </div>
            )}
          </div>

          {/* Fixed Action Buttons */}
          {showDiscoverButton && (
            <div className="flex gap-3 p-6 pt-4 border-t border-border bg-card rounded-b-xl flex-shrink-0">
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
                className="flex-1 bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
              >
                <Search className="h-4 w-4 mr-0.5" />
                Apply Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Filters Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 xl:hidden flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card rounded-xl border border-border max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-card rounded-t-xl">
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
            <div className="flex gap-3 p-6 pt-4 border-t border-border bg-card rounded-b-xl">
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="flex-1"
                disabled={activeFiltersCount === 0}
              >
                Clear All
              </Button>
              {showDiscoverButton && (
                <Button
                  onClick={handleDiscover}
                  className="flex-1 bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
                >
                  <Search className="h-4 w-4 mr-0.5" />
                  Apply Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};