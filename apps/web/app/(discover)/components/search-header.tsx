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
  showMobileFilters,
  setShowMobileFilters,
  activeFiltersCount,
}) => {
  return (
    <div className="xl:hidden">
      <Button
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        variant="outline"
        className="w-full justify-center border-[#01ae79]/20 dark:border-[#01ae79]/25 hover:border-[#01ae79]/40 hover:bg-[#01ae79]/5 hover:text-[#01ae79] h-11"
      >
        <Filter className="h-4 w-4 mr-2" />
        <span>
          {activeFiltersCount > 0
            ? `${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''} applied`
            : 'Filters'}
        </span>
      </Button>
    </div>
  );
};
