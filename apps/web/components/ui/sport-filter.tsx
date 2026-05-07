"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { FILTER_POPOVER_CONTENT_PROPS } from "@/components/ui/filter-popover";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSportName, getCategorizedSports } from "@/lib/sports-data";

// Filter option interface
export interface FilterOption {
  value: string;
  label: string;
}

// Sport filter component for search/filter pages
export interface SportFilterProps {
  selected: FilterOption[];
  onSelectionChange: (selected: FilterOption[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
  className?: string;
}

export function SportFilter({
  selected,
  onSelectionChange,
  placeholder,
  searchPlaceholder = "Search sports...",
  className
}: SportFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const categorizedSports = getCategorizedSports();

  // Filter sports for each gender category based on search
  const filterSports = (sports: { sport: string; positions: string[] }[]) => 
    sports.filter(sportData => 
      sportData.sport.toLowerCase().includes(searchTerm.toLowerCase())
    ).map(sportData => ({
      value: sportData.sport,
      label: formatSportName(sportData.sport)
    }));

  const filteredMensSports = filterSports(categorizedSports.mens);
  const filteredFemalesSports = filterSports(categorizedSports.females);

  // Use consistent categorized order - Men's Sports first, then Women's Sports
  const sportGroups = [
    { title: "Men's Sports", sports: filteredMensSports },
    { title: "Women's Sports", sports: filteredFemalesSports }
  ];

  const handleSelectAll = () => {
    const allOptions = [...filteredMensSports, ...filteredFemalesSports];
    if (selected.length === allOptions.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allOptions);
    }
  };

  const handleToggleOption = (option: FilterOption) => {
    const isSelected = selected.some(s => s.value === option.value);
    if (isSelected) {
      onSelectionChange(selected.filter(s => s.value !== option.value));
    } else {
      onSelectionChange([...selected, option]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between text-left font-normal h-9 text-sm", className)}
        >
          <span className="truncate">
            {selected.length === 0
              ? placeholder
              : selected.length === 1
                ? selected[0].label
                : `${selected.length} selected`
            }
          </span>
          <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent {...FILTER_POPOVER_CONTENT_PROPS}>
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="h-8 text-sm"
          />
          <CommandList className="max-h-72">
            <div className="px-2 py-1">
              <Button
                variant="ghost"
                onClick={handleSelectAll}
                className="w-full justify-start text-xs h-7 px-2"
              >
                {selected.length === filteredMensSports.length + filteredFemalesSports.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            
            {sportGroups.every(group => group.sports.length === 0) ? (
              <CommandEmpty>No sports found.</CommandEmpty>
            ) : (
              sportGroups.map(group => 
                group.sports.length > 0 && (
                  <CommandGroup key={group.title} heading={group.title}>
                    {group.sports.map((sport) => (
                      <div key={sport.value} className="flex items-center space-x-2 px-2 py-1.5 hover:bg-accent/50 rounded-sm transition-colors">
                        <Checkbox
                          id={sport.value}
                          checked={selected.some(s => s.value === sport.value)}
                          onCheckedChange={() => handleToggleOption(sport)}
                          className="h-3.5 w-3.5"
                        />
                        <Label 
                          htmlFor={sport.value} 
                          className="text-xs cursor-pointer flex-1 leading-tight"
                        >
                          {sport.label}
                        </Label>
                      </div>
                    ))}
                  </CommandGroup>
                )
              )
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
