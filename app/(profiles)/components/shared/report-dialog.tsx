"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Flag,
  ShieldAlert,
  Users,
  MessageSquare,
  AlertTriangle,
  UserX,
  FileText,
} from "lucide-react";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileName: string;
  profileType: "athlete" | "coach" | "recruiter";
}

const reportReasons = [
  {
    id: "hate",
    label: "Hate Speech or Harassment",
    description: "Threatening, hateful, or discriminatory content",
    icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
  },
  {
    id: "impersonation",
    label: "Impersonation",
    description: "Pretending to be someone else or a fake account",
    icon: <UserX className="w-5 h-5 text-orange-600" />,
  },
  {
    id: "underage",
    label: "Underage User",
    description: "User appears to be under 13 years old",
    icon: <Users className="w-5 h-5 text-blue-600" />,
  },
  {
    id: "inappropriate",
    label: "Inappropriate Content",
    description: "Sexual, violent, or otherwise inappropriate content",
    icon: <AlertTriangle className="w-5 h-5 text-purple-600" />,
  },
  {
    id: "spam",
    label: "Spam or Scam",
    description: "Spam messages, fake recruitment, or fraudulent activity",
    icon: <MessageSquare className="w-5 h-5 text-yellow-600" />,
  },
  {
    id: "false_info",
    label: "False Information",
    description: "Fake credentials, stats, or misleading profile information",
    icon: <FileText className="w-5 h-5 text-gray-600" />,
  },
  {
    id: "other",
    label: "Other",
    description: "Something else that violates our community guidelines",
    icon: <Flag className="w-5 h-5 text-gray-500" />,
  },
];

export function ReportDialog({ open, onOpenChange, profileName, profileType }: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId === selectedReason ? "" : reasonId);
  };

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    
    // TODO: Implement actual report submission logic
    console.log("Report submitted:", {
      profileName,
      profileType,
      reason: selectedReason,
      details: additionalDetails,
    });
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    onOpenChange(false);
    
    // Reset form
    setSelectedReason("");
    setAdditionalDetails("");
  };

  const selectedReasonData = reportReasons.find((reason) => reason.id === selectedReason);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-lg max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Flag className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="break-words">Report {profileName}</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Help us keep UpDrafted safe by reporting profiles that violate our community guidelines.
            All reports are reviewed confidentially.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Reasons */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Why are you reporting this {profileType} profile?
            </Label>
            <div className="space-y-3">
              {reportReasons.map((reason) => (
                <div
                  key={reason.id}
                  onClick={() => handleReasonSelect(reason.id)}
                  className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedReason === reason.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedReason === reason.id
                          ? "border-primary bg-primary"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedReason === reason.id && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {reason.icon}
                      <span className="font-medium text-sm">{reason.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          {selectedReason && (
            <div>
              <Label htmlFor="additional-details" className="text-base font-medium">
                Additional Details {selectedReason === "other" ? "(Required)" : "(Optional)"}
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedReasonData && (
                  <>Please provide more information about: {selectedReasonData.label.toLowerCase()}</>
                )}
              </p>
              <Textarea
                id="additional-details"
                placeholder="Please describe what you observed and provide any additional context..."
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                className="w-full min-w-0 text-sm"
                rows={4}
              />
            </div>
          )}

          {/* Information Notice */}
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Review Process
                </p>
                <p className="text-amber-800 dark:text-amber-200">
                  Our moderation team will review this report within 24-48 hours. 
                  False reports may result in restrictions to your account.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || (selectedReason === "other" && !additionalDetails.trim()) || isSubmitting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "Submitting Report..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 