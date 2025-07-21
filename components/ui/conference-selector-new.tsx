"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Check } from "lucide-react";
import { getConferencesForDivision, divisionHasConferences } from "@/lib/conference-data";

interface ConferenceSelectorProps {
  division: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  inDialog?: boolean; // Add this prop for dialog usage
}

export function ConferenceSelector({
  division,
  value,
  onValueChange,
  placeholder = "Select conference",
  label = "Conference",
  required = false,
  className = "",
  disabled = false,
  inDialog = false
}: ConferenceSelectorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newConferenceName, setNewConferenceName] = useState("");

  // Don't show for high school or if no division selected
  if (!division || !divisionHasConferences(division)) {
    return null;
  }

  const conferences = getConferencesForDivision(division);
  const hasCustomValue = value && !conferences.includes(value);

  const handleAddConference = () => {
    if (!newConferenceName.trim()) return;

    // For static data, we'll just add it as a custom value
    // In a real app, you might want to submit this for review
    onValueChange(newConferenceName.trim());
    setIsAddDialogOpen(false);
    setNewConferenceName("");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="conference" className="text-sm font-medium">
        {label} {required && '*'}
      </Label>
      <div className="flex gap-2">
        <Select
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-11 bg-background flex-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={inDialog ? "z-[70]" : ""}>
            {conferences.map((conference) => (
              <SelectItem key={conference} value={conference}>
                {conference}
              </SelectItem>
            ))}
            {hasCustomValue && (
              <SelectItem value={value}>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  {value} (Custom)
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0"
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
    </div>
  );
}
