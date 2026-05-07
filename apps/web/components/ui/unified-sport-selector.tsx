"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSportName, getCategorizedSports, getSportCategory } from "@/lib/sports-data";

// Unified interface for both single and multi selection
export interface UnifiedSportSelectorProps {
  // Selection mode
  mode: 'single' | 'multi';
  
  // Single selection props
  value?: string;
  onValueChange?: (value: string) => void;
  
  // Multi selection props
  selectedSports?: string[];
  onSportsChange?: (sports: string[]) => void;
  maxSelection?: number;
  
  // Common props
  placeholder?: string;
  excludeSports?: string[];
  userGender?: 'male' | 'female' | null;
  userCurrentSport?: string;
  className?: string;
  disabled?: boolean;
}

export function UnifiedSportSelector({ 
  mode,
  value,
  onValueChange,
  selectedSports = [],
  onSportsChange,
  maxSelection,
  placeholder = "Select sport...",
  excludeSports = [],
  userGender,
  userCurrentSport,
  className,
  disabled = false
}: UnifiedSportSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const selectedItemRef = useRef<HTMLDivElement>(null);

  // Validate props based on mode
  if (mode === 'single' && (!onValueChange)) {
    throw new Error('UnifiedSportSelector: onValueChange is required for single mode');
  }
  
  if (mode === 'multi' && (!onSportsChange)) {
    throw new Error('UnifiedSportSelector: onSportsChange is required for multi mode');
  }

  // Get categorized sports
  const categorizedSports = getCategorizedSports();
  
  // For single mode, exclude selected sport and other excluded sports
  // For multi mode, exclude already selected sports and other excluded sports
  const getExcludedSports = () => {
    if (mode === 'single') {
      return [...excludeSports];
    } else {
      return [...excludeSports, ...selectedSports];
    }
  };

  const currentExclusions = getExcludedSports();
  
  // Filter out excluded sports from each category
  const mensSports = categorizedSports.mens
    .map(s => s.sport)
    .filter(sport => !currentExclusions.includes(sport));
  const femalesSports = categorizedSports.females
    .map(s => s.sport)
    .filter(sport => !currentExclusions.includes(sport));

  // Apply search filter
  const filterSports = (sports: string[]) => 
    sports.filter(sport => 
      sport.toLowerCase().includes(searchValue.toLowerCase())
    );

  const filteredMensSports = filterSports(mensSports);
  const filteredFemalesSports = filterSports(femalesSports);

  // Determine order based on user preference
  const getUserPreferredOrder = () => {
    // If user has a current sport, prioritize that category
    if (userCurrentSport) {
      const category = getSportCategory(userCurrentSport);
      if (category === 'mens') {
        return [
          { title: "Men's Sports", sports: filteredMensSports },
          { title: "Women's Sports", sports: filteredFemalesSports }
        ];
      } else if (category === 'females') {
        return [
          { title: "Women's Sports", sports: filteredFemalesSports },
          { title: "Men's Sports", sports: filteredMensSports }
        ];
      }
    }
    
    // If user has gender preference
    if (userGender === 'male') {
      return [
        { title: "Men's Sports", sports: filteredMensSports },
        { title: "Women's Sports", sports: filteredFemalesSports }
      ];
    } else if (userGender === 'female') {
      return [
        { title: "Women's Sports", sports: filteredFemalesSports },
        { title: "Men's Sports", sports: filteredMensSports }
      ];
    }

    // Default order
    return [
      { title: "Men's Sports", sports: filteredMensSports },
      { title: "Women's Sports", sports: filteredFemalesSports }
    ];
  };

  const orderedSportsGroups = getUserPreferredOrder().filter(group => group.sports.length > 0);

  // Handle selection based on mode
  const handleSportSelect = (sport: string) => {
    if (mode === 'single') {
      onValueChange!(sport === value ? "" : sport);
    } else {
      if (maxSelection && selectedSports.length >= maxSelection) {
        return; // Don't add if at max
      }
      onSportsChange!([...selectedSports, sport]);
    }
    
    setOpen(false);
    setSearchValue("");
  };

  const handleSportRemove = (sport: string) => {
    if (mode === 'multi') {
      onSportsChange!(selectedSports.filter(s => s !== sport));
    }
  };

  // Scroll to selected item when dropdown opens (single mode only)
  useEffect(() => {
    if (mode === 'single' && open && value && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [open, value, mode]);

  // Check if we can add more (multi mode)
  const canAddMore = mode === 'single' || !maxSelection || selectedSports.length < maxSelection;

  // Get current display text
  const getDisplayText = () => {
    if (mode === 'single') {
      return value ? formatSportName(value) : placeholder;
    } else {
      if (selectedSports.length === 0) {
        return placeholder;
      } else {
        return "Add another sport...";
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Selected Sports Display (Multi mode only) */}
      {mode === 'multi' && selectedSports.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSports.map(sport => (
            <Badge key={sport} variant="secondary" className="flex items-center gap-1">
              {formatSportName(sport)}
              {!disabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleSportRemove(sport)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Sport Selector */}
      {(mode === 'single' || canAddMore) && !disabled && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn("h-11 w-full justify-between bg-background font-normal", className)}
              disabled={disabled}
            >
              {getDisplayText()}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
            <Command>
              <CommandInput 
                placeholder="Search sports..." 
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList className="max-h-[300px]">
                <CommandEmpty>No sport found.</CommandEmpty>
                {orderedSportsGroups.map((group) => (
                  <CommandGroup key={group.title} heading={group.title}>
                    {group.sports.map((sport) => (
                      <CommandItem
                        key={sport}
                        value={sport}
                        ref={mode === 'single' && value === sport ? selectedItemRef : undefined}
                        onSelect={() => handleSportSelect(sport)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            mode === 'single' && value === sport ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {formatSportName(sport)}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {/* Max selection indicator (Multi mode only) */}
      {mode === 'multi' && maxSelection && selectedSports.length >= maxSelection && (
        <p className="text-xs text-muted-foreground">
          Maximum of {maxSelection} sports selected.
        </p>
      )}

      {/* Disabled state display */}
      {disabled && (
        <div className={cn("h-11 w-full flex items-center px-3 border border-border rounded-md bg-muted text-muted-foreground", className)}>
          {mode === 'single' && value ? formatSportName(value) : placeholder}
        </div>
      )}
    </div>
  );
}
