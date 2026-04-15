"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface SearchHeaderProps {
  title: string;
  subtitle: string;
  showMobileFilters: boolean;
  setShowMobileFilters: (show: boolean) => void;
  activeFiltersCount: number;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  title,
  subtitle,
  showMobileFilters,
  setShowMobileFilters,
  activeFiltersCount
}) => {
  return (
    <div className="xl:hidden mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
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
          className="relative flex-shrink-0 w-[120px] justify-center"
        >
          <Filter className="h-4 w-4 mr-2" />
          <span className="truncate">
            {activeFiltersCount > 0 ? `${activeFiltersCount} Filter${activeFiltersCount !== 1 ? 's' : ''}` : 'Filters'}
          </span>
        </Button>
      </div>
    </div>
  );
};