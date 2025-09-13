"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Lock, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  MultiSelectFilter, 
  HeightWeightFilter, 
  VerifiedFilter, 
  FilterOption 
} from "./filter-components";

export interface AdvancedFiltersProps {
  // User role and subscription status
  effectiveRole: string;
  hasAdvancedSearch: boolean;
  
  // Filter options
  graduatingClassOptions: FilterOption[];
  positionsOptions: FilterOption[];
  conferencesOptions: FilterOption[];
  
  // Selected values
  selectedGraduatingClasses: FilterOption[];
  selectedPositions: FilterOption[];
  selectedConferences: FilterOption[];
  selectedSports: FilterOption[];
  selectedDivisions: FilterOption[];
  
  // Physical filters
  minHeight: number;
  minWeight: number;
  verifiedFilter: boolean | null;
  
  // Change handlers
  setSelectedGraduatingClasses: (selected: FilterOption[]) => void;
  setSelectedPositions: (selected: FilterOption[]) => void;
  setSelectedConferences: (selected: FilterOption[]) => void;
  setMinHeight: (height: number) => void;
  setMinWeight: (weight: number) => void;
  setVerifiedFilter: (verified: boolean | null) => void;
  
  // Premium upgrade handler
  handleUpgradeClick: () => void;
}

export function AdvancedFilters({
  effectiveRole,
  hasAdvancedSearch,
  graduatingClassOptions,
  positionsOptions,
  conferencesOptions,
  selectedGraduatingClasses,
  selectedPositions,
  selectedConferences,
  selectedSports,
  selectedDivisions,
  minHeight,
  minWeight,
  verifiedFilter,
  setSelectedGraduatingClasses,
  setSelectedPositions,
  setSelectedConferences,
  setMinHeight,
  setMinWeight,
  setVerifiedFilter,
  handleUpgradeClick
}: AdvancedFiltersProps) {
  const isCoachOrRecruiterOrAdmin = effectiveRole === 'coach' || effectiveRole === 'recruiter' || effectiveRole === 'admin';

  // Check if sports/divisions are selected for enabling positions/conferences
  const canUsePositions = selectedSports.length > 0;
  const canUseConferences = selectedDivisions.length > 0 && !selectedDivisions.some(div => div.value === 'High School');

  const hasPremiumFilters = !hasAdvancedSearch; // Always show for non-premium users

  // Professional premium upgrade overlay
  if (!hasAdvancedSearch && hasPremiumFilters) {
    return (
      <div className="border-t pt-4 relative">
        <h3 className="text-sm font-medium text-foreground mb-3">Advanced Filters</h3>
        
        {/* Show filters in background with reduced opacity */}
        <div className="space-y-4 opacity-40">
          {/* Graduating Class Filter - Preview */}
          {isCoachOrRecruiterOrAdmin && graduatingClassOptions.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Graduating Class
              </label>
              <div className="h-10 flex items-center px-3 py-2 border border-border rounded-md bg-muted/50 text-muted-foreground text-sm">
                Select graduation years...
              </div>
            </div>
          )}
          
          {/* Physical Requirements Preview */}
          {isCoachOrRecruiterOrAdmin && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Height & Weight Requirements
                </label>
                <div className="h-10 flex items-center px-3 py-2 border border-border rounded-md bg-muted/50 text-muted-foreground text-sm">
                  Set minimum requirements...
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Verification Status
                </label>
                <div className="h-10 flex items-center px-3 py-2 border border-border rounded-md bg-muted/50 text-muted-foreground text-sm">
                  Filter by verification...
                </div>
              </div>
            </>
          )}
          
          {/* Positions and Conferences Preview - Individual lines for consistency */}
          <div className="space-y-4">
            {/* Positions Filter Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Positions
              </label>
              <div className="h-10 flex items-center px-3 py-2 border border-border rounded-md bg-muted/50 text-muted-foreground text-sm">
                Upgrade to unlock positions
              </div>
            </div>
            
            {/* Conferences Filter Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Conferences
              </label>
              <div className="h-10 flex items-center px-3 py-2 border border-border rounded-md bg-muted/50 text-muted-foreground text-sm">
                Upgrade to unlock conferences
              </div>
            </div>
          </div>
        </div>
        
        {/* Premium Overlay - Better contained to prevent scroll issues */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-background/15 to-background/20 backdrop-blur-[1px] rounded-lg border border-border/30 flex items-center justify-center z-10 overflow-hidden">
          <div className="text-center space-y-3 p-4 sm:p-6 bg-background/95 rounded-lg border border-border/50 shadow-lg backdrop-blur-sm max-w-xs mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
              <span className="text-base sm:text-lg font-semibold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                Advanced Filters
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Unlock powerful filtering options including graduation year, positions, conferences, and more
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={handleUpgradeClick}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                size="sm"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-4">
      <h3 className="text-sm font-medium text-foreground mb-3">Advanced Filters</h3>
      
      {/* For Coaches/Recruiters/Admins viewing Athletes */}
      {isCoachOrRecruiterOrAdmin && (
        <>
          {/* Graduating Class Filter - First in Advanced Filters */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground mb-2">
                Graduating Class
              </label>
              {!hasAdvancedSearch && (
                <div 
                  className="flex items-center gap-1 text-xs text-amber-600 cursor-pointer hover:text-amber-700 transition-colors" 
                  onClick={handleUpgradeClick}
                >
                  <Crown className="h-3 w-3" />
                  <span>Premium</span>
                </div>
              )}
            </div>
            <div className={cn("relative", !hasAdvancedSearch && "pointer-events-none opacity-50")}>
              <MultiSelectFilter
                options={graduatingClassOptions}
                selected={hasAdvancedSearch ? selectedGraduatingClasses : []}
                onSelectionChange={hasAdvancedSearch ? setSelectedGraduatingClasses : () => {}}
                placeholder="Select graduation years..."
                searchPlaceholder="Search years..."
              />
              {!hasAdvancedSearch && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUpgradeClick}
                    className="text-xs"
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Upgrade for Graduation Filter
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Height/Weight Filters */}
          <div className="mb-4">
            <HeightWeightFilter
              minHeight={minHeight}
              minWeight={minWeight}
              onHeightChange={setMinHeight}
              onWeightChange={setMinWeight}
              isPremium={hasAdvancedSearch}
              onUpgradeClick={handleUpgradeClick}
            />
          </div>

          {/* Verified Status Filter */}
          <div className="mb-4">
            <VerifiedFilter
              verifiedFilter={verifiedFilter}
              onVerifiedChange={setVerifiedFilter}
              isPremium={hasAdvancedSearch}
              onUpgradeClick={handleUpgradeClick}
            />
          </div>
        </>
      )}

      {/* Positions Filter - Individual filter like other premium features */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground mb-2">
            Positions
          </label>
          {!hasAdvancedSearch && (
            <div 
              className="flex items-center gap-1 text-xs text-amber-600 cursor-pointer hover:text-amber-700 transition-colors" 
              onClick={handleUpgradeClick}
            >
              <Crown className="h-3 w-3" />
              <span>Premium</span>
            </div>
          )}
        </div>
        {!hasAdvancedSearch ? (
          <div className={cn("relative", "pointer-events-none opacity-50")}>
            <MultiSelectFilter
              options={[]}
              selected={[]}
              onSelectionChange={() => {}}
              placeholder="Upgrade to unlock positions"
              searchPlaceholder="Search positions..."
            />
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpgradeClick}
                className="text-xs"
              >
                <Lock className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            </div>
          </div>
        ) : (
          <div className={cn("relative", !canUsePositions && "pointer-events-none opacity-50")}>
            <MultiSelectFilter
              options={canUsePositions ? positionsOptions : []}
              selected={canUsePositions ? selectedPositions : []}
              onSelectionChange={canUsePositions ? setSelectedPositions : () => {}}
              placeholder={!canUsePositions ? "Select sports first..." : "Select positions..."}
              searchPlaceholder="Search positions..."
            />
          </div>
        )}
      </div>

      {/* Conferences Filter - Individual filter like other premium features */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground mb-2">
            Conferences
          </label>
          {!hasAdvancedSearch && (
            <div 
              className="flex items-center gap-1 text-xs text-amber-600 cursor-pointer hover:text-amber-700 transition-colors" 
              onClick={handleUpgradeClick}
            >
              <Crown className="h-3 w-3" />
              <span>Premium</span>
            </div>
          )}
        </div>
        {!hasAdvancedSearch ? (
          <div className={cn("relative", "pointer-events-none opacity-50")}>
            <MultiSelectFilter
              options={[]}
              selected={[]}
              onSelectionChange={() => {}}
              placeholder="Upgrade to unlock conferences"
              searchPlaceholder="Search conferences..."
            />
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpgradeClick}
                className="text-xs"
              >
                <Lock className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            </div>
          </div>
        ) : (
          <div className={cn("relative", !canUseConferences && "pointer-events-none opacity-50")}>
            <MultiSelectFilter
              options={canUseConferences ? conferencesOptions : []}
              selected={canUseConferences ? selectedConferences : []}
              onSelectionChange={canUseConferences ? setSelectedConferences : () => {}}
              placeholder={!canUseConferences ? "Select college divisions first..." : "Select conferences..."}
              searchPlaceholder="Search conferences..."
            />
          </div>
        )}
      </div>
    </div>
  );
}