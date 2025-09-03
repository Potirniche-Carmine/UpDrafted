"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Users, MessageSquare, AlertTriangle } from "lucide-react";

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileName: string;
  profileType: "athlete" | "coach" | "recruiter";
  onConfirm: (note?: string) => void;
  isConnecting?: boolean;
}

export function ConnectionDialog({
  open,
  onOpenChange,
  profileName,
  profileType,
  onConfirm,
  isConnecting = false
}: ConnectionDialogProps) {
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");

  const handleNoteChange = (value: string) => {
    setNote(value);
    
    // Validate note length
    if (value.length > 500) {
      setNoteError("Note must be 500 characters or less");
    } else {
      setNoteError("");
    }
  };

  const handleConfirm = () => {
    if (noteError) return;
    
    onConfirm(note.trim() || undefined);
    setNote("");
    setNoteError("");
  };

  const handleCancel = () => {
    setNote("");
    setNoteError("");
    onOpenChange(false);
  };

  const getActionLabel = () => {
    switch (profileType) {
      case "athlete":
        return "Connect";
      case "coach":
        return "Connect with Coach";
      case "recruiter":
        return "Get Recruited";
      default:
        return "Connect";
    }
  };

  const getIcon = () => {
    switch (profileType) {
      case "athlete":
        return <Star className="w-5 h-5" />;
      case "coach":
        return <Users className="w-5 h-5" />;
      case "recruiter":
        return <Users className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getDescription = () => {
    switch (profileType) {
      case "athlete":
        return `Send a connection request to ${profileName} to add them to your network. You can include an optional message to introduce yourself.`;
      case "coach":
        return `Send a connection request to Coach ${profileName}. This will notify them of your interest in their program.`;
      case "recruiter":
        return `Send a connection request to ${profileName}. This will notify them of your interest in their recruiting services.`;
      default:
        return `Send a connection request to ${profileName}.`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getActionLabel()}
          </DialogTitle>
          <DialogDescription className="text-left">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Security Note */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium">Connection Security</p>
              <p>All connection requests are monitored for security. Only you and {profileName} will see your message.</p>
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-2">
            <Label htmlFor="note">Optional Message</Label>
            <Textarea
              id="note"
              placeholder={`Introduce yourself to ${profileName}...`}
              value={note}
              onChange={(e) => handleNoteChange(e.target.value)}
              rows={3}
              maxLength={500}
              className={noteError ? "border-red-500" : ""}
            />
            <div className="flex justify-between text-sm">
              <span className={noteError ? "text-red-500" : "text-muted-foreground"}>
                {noteError || "Optional: Add a personal message to stand out"}
              </span>
              <span className={`${note.length > 450 ? "text-amber-600" : "text-muted-foreground"}`}>
                {note.length}/500
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isConnecting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConnecting || !!noteError}
            className="flex-1 bg-[#01ae79] hover:bg-[#01ae79]/90"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                {getIcon()}
                Send Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 