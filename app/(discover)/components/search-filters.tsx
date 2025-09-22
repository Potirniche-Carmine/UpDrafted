"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Search, X } from "lucide-react";
import { AdvancedFilters } from './advanced-filters';
import { MultiSelectFilter, type FilterOption } from './filter-components';

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
  sportsOptions: FilterOption[];
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
  sportsOptions,
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
  const renderFiltersContent = () => (
    <div className="space-y-1.5 sm:space-y-4 min-h-[300px]">
      {/* Sports Filter */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Sports
          {(effectiveRole === 'coach' || effectiveRole === 'recruiter') && (
            <span className="ml-2 text-xs text-muted-foreground">
              💡 Select one sport to filter by positions
            </span>
          )}
        </label>
        <MultiSelectFilter
          options={sportsOptions}
          selected={selectedSports}
          onSelectionChange={setSelectedSports}
          placeholder="Select sports..."
          searchPlaceholder="Search sports..."
        />
      </div>

      {/* Divisions Filter */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
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
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
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
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
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

      {showDiscoverButton && (
        <div className="flex gap-3">
          <Button
            onClick={clearFilters}
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
  );

  return (
    <>
      {/* Desktop Filters Sidebar */}
      <div className="hidden xl:block w-full xl:w-80 flex-shrink-0">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 sticky top-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
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

          <div className="flex items-center justify-between mb-4 h-6">
            <h2 className="text-sm font-medium text-foreground">Filters</h2>
            {activeFiltersCount > 0 && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Clear All
              </Button>
            )}
          </div>

          {renderFiltersContent()}
        </div>
      </div>

      {/* Mobile/Tablet Filters Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 xl:hidden flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card rounded-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Filters</h2>
              <Button
                onClick={() => setShowMobileFilters(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {renderFiltersContent()}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={clearFilters}
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