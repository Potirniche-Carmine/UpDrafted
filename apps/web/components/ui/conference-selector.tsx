"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Check, ChevronDown } from "lucide-react";
import { getConferencesForDivision, divisionHasConferences } from "@/lib/conference-data";
import { cn } from "@/lib/utils";

interface ConferenceSelectorProps {
  division: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  inDialog?: boolean; // Add this prop for dialog usage
  labelClassName?: string; // Add this prop for label styling
  description?: string; // Add this prop for description text
  height?: string; // Add this prop for height customization
}

export function ConferenceSelector({
  division,
  value,
  onValueChange,
  placeholder = "Select conference",
  label = "Conference",
  required = false,
  disabled = false,
  inDialog = false,
  labelClassName = "text-sm font-medium",
  description,
  height = "h-11"
}: ConferenceSelectorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newConferenceName, setNewConferenceName] = useState("");
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Don't show for high school or if no division selected
  if (!division || !divisionHasConferences(division)) {
    return null;
  }

  const conferences = getConferencesForDivision(division);
  const hasCustomValue = value && !conferences.includes(value);

  // Filter conferences based on search term
  const filteredConferences = conferences.filter(conference =>
    conference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddConference = () => {
    if (!newConferenceName.trim()) return;

    // For static data, we'll just add it as a custom value
    // In a real app, you might want to submit this for review
    onValueChange(newConferenceName.trim());
    setIsAddDialogOpen(false);
    setNewConferenceName("");
  };

  const handleSelectConference = (selectedConference: string) => {
    onValueChange(selectedConference);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <>
      {label && (
        <Label htmlFor="conference" className={labelClassName}>
          {label} {required && '*'}
        </Label>
      )}
      <div className="flex gap-1 w-full max-w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn("flex-1 min-w-0 justify-between text-left font-normal bg-background border-input", height)}
              disabled={disabled}
            >
              <span className="truncate">
                {value || placeholder}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={`w-[var(--radix-popover-trigger-width)] max-w-[90vw] p-0 ${inDialog ? "z-[70]" : ""}`} align="start" side="bottom" sideOffset={4}>
            <Command>
              <CommandInput
                placeholder="Search conferences..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>No conferences found.</CommandEmpty>
                <CommandGroup>
                  {filteredConferences.map((conference) => (
                    <CommandItem
                      key={conference}
                      onSelect={() => handleSelectConference(conference)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === conference ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {conference}
                    </CommandItem>
                  ))}
                  {hasCustomValue && (
                    <CommandItem
                      onSelect={() => handleSelectConference(value)}
                      className="cursor-pointer"
                    >
                      <Check className="mr-2 h-4 w-4 opacity-100" />
                      <div className="flex items-center gap-2">
                        {value} (Custom)
                      </div>
                    </CommandItem>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn("w-9 shrink-0 bg-background border-input hover:bg-accent hover:text-accent-foreground", height)}
              disabled={disabled}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Conference</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="division-display">Division</Label>
                <Input
                  id="division-display"
                  value={division}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-conference">Conference Name</Label>
                <Input
                  id="new-conference"
                  value={newConferenceName}
                  onChange={(e) => setNewConferenceName(e.target.value)}
                  placeholder="e.g., Big 12 Conference"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddConference();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewConferenceName("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddConference}
                disabled={!newConferenceName.trim()}
              >
                Add Conference
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </>
  );
}
