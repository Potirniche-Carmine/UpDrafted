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
    <>
      {label && (
        <Label htmlFor="conference" className={labelClassName}>
          {label} {required && '*'}
        </Label>
      )}
      <div className="flex gap-1">
        <Select
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
        >
          <SelectTrigger className={`${height} bg-background flex-1`}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={`max-h-[150px] overflow-y-auto ${inDialog ? "z-[70]" : ""}`}>
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
              className={`${height} w-9 h-9 shrink-0`}
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
