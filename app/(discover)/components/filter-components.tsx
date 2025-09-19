"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronDown, Lock, Crown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper function to convert inches to feet and inches string
function inchesToFeetString(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}

// Filter option interface
export interface FilterOption {
  value: string;
  label: string;
}

// Multi-select filter component
export interface MultiSelectFilterProps {
  options: FilterOption[];
  selected: FilterOption[];
  onSelectionChange: (selected: FilterOption[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
  className?: string;
}

export function MultiSelectFilter({
  options,
  selected,
  onSelectionChange,
  placeholder,
  searchPlaceholder = "Search...",
  className
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(options);
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
          className={cn("w-full justify-between text-left font-normal", className)}
        >
          <span className="truncate">
            {selected.length === 0
              ? placeholder
              : selected.length === 1
                ? selected[0].label
                : `${selected.length} selected`
            }
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] sm:w-[var(--radix-popover-trigger-width)] max-w-[90vw] p-0" align="center" side="bottom" sideOffset={4}>
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {/* Select All Option */}
              <CommandItem
                onSelect={handleSelectAll}
                className="cursor-pointer"
              >
                <Checkbox
                  checked={selected.length === options.length}
                  className="mr-2"
                />
                <span className="font-medium">
                  {selected.length === options.length ? 'Deselect All' : 'Select All'}
                </span>
              </CommandItem>

              {/* Individual Options */}
              {filteredOptions.map((option) => {
                const isSelected = selected.some(s => s.value === option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleToggleOption(option)}
                    className="cursor-pointer"
                  >
                    <Checkbox
                      checked={isSelected}
                      className="mr-2"
                    />
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Height/Weight Range Filter Component
export interface HeightWeightFilterProps {
  minHeight: number;
  minWeight: number;
  onHeightChange: (height: number) => void;
  onWeightChange: (weight: number) => void;
  className?: string;
  isPremium?: boolean;
  onUpgradeClick?: () => void;
}

export function HeightWeightFilter({
  minHeight,
  minWeight,
  onHeightChange,
  onWeightChange,
  className,
  isPremium = false,
  onUpgradeClick
}: HeightWeightFilterProps) {
  const isLocked = !isPremium;
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">
            Minimum Height: {inchesToFeetString(minHeight)}
          </Label>
          {isLocked && (
            <div 
              className="flex items-center gap-1 text-xs text-amber-600 cursor-pointer hover:text-amber-700 transition-colors" 
              onClick={onUpgradeClick}
            >
              <Crown className="h-3 w-3" />
              <span>Premium</span>
            </div>
          )}
        </div>
        <div className={cn("relative", isLocked && "pointer-events-none opacity-50")}>
          <Slider
            value={[minHeight]}
            onValueChange={(value: number[]) => onHeightChange(value[0])}
            min={48} // 4'0"
            max={96} // 8'0"
            step={1}
            className="w-full"
            disabled={isLocked}
          />
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
              <Button
                variant="outline"
                size="sm"
                onClick={onUpgradeClick}
                className="text-xs"
              >
                <Lock className="h-3 w-3 mr-1" />
                Upgrade for Height Filter
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>4&apos;0&quot;</span>
          <span>8&apos;0&quot;</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">
            Minimum Weight: {minWeight} lbs
          </Label>
          {isLocked && (
            <div 
              className="flex items-center gap-1 text-xs text-amber-600 cursor-pointer hover:text-amber-700 transition-colors" 
              onClick={onUpgradeClick}
            >
              <Crown className="h-3 w-3" />
              <span>Premium</span>
            </div>
          )}
        </div>
        <div className={cn("relative", isLocked && "pointer-events-none opacity-50")}>
          <Slider
            value={[minWeight]}
            onValueChange={(value: number[]) => onWeightChange(value[0])}
            min={50}
            max={500}
            step={5}
            className="w-full"
            disabled={isLocked}
          />
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
              <Button
                variant="outline"
                size="sm"
                onClick={onUpgradeClick}
                className="text-xs"
              >
                <Lock className="h-3 w-3 mr-1" />
                Upgrade for Weight Filter
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>50 lbs</span>
          <span>500 lbs</span>
        </div>
      </div>
    </div>
  );
}

// Verified Filter Component
export interface VerifiedFilterProps {
  verifiedFilter: boolean | null;
  onVerifiedChange: (verified: boolean | null) => void;
  className?: string;
  isPremium?: boolean;
  onUpgradeClick?: () => void;
}

export function VerifiedFilter({
  verifiedFilter,
  onVerifiedChange,
  className,
  isPremium = false,
  onUpgradeClick
}: VerifiedFilterProps) {
  const isLocked = !isPremium;
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">
          Verification Status
        </Label>
        {isLocked && (
          <div 
            className="flex items-center gap-1 text-xs text-amber-600 cursor-pointer hover:text-amber-700 transition-colors" 
            onClick={onUpgradeClick}
          >
            <Crown className="h-3 w-3" />
            <span>Premium</span>
          </div>
        )}
      </div>
      
      <div className={cn("relative", isLocked && "pointer-events-none opacity-50")}>
        <div 
          className={cn(
            "flex items-center justify-between p-3 border rounded-md transition-all duration-200",
            !isLocked && "cursor-pointer hover:bg-accent/50",
            verifiedFilter === true 
              ? "bg-primary/10 border-primary/20 hover:bg-primary/20" 
              : "bg-background border-border hover:bg-accent/30"
          )}
          onClick={!isLocked ? () => onVerifiedChange(verifiedFilter === true ? null : true) : undefined}
        >
          <div className="flex items-center gap-2">
            <Shield className={cn(
              "h-4 w-4",
              verifiedFilter === true ? "text-primary" : "text-muted-foreground"
            )} />
            <span className="text-sm font-medium">Verified Only</span>
          </div>
          <div className={cn(
            "px-3 py-1 rounded text-xs font-medium transition-colors",
            verifiedFilter === true 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            {verifiedFilter === true ? "On" : "Off"}
          </div>
        </div>
        
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
            <Button
              variant="outline"
              size="sm"
              onClick={onUpgradeClick}
              className="text-xs"
            >
              <Lock className="h-3 w-3 mr-1" />
              Upgrade for Verified Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}