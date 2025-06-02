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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Link,
  X,
  Shield,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "coach" | "recruiter" | "athlete";
}

interface VerificationFile {
  id: string;
  name: string;
  type: "pdf" | "image" | "link";
  file?: File;
  url?: string;
  description?: string;
  uploaded?: boolean;
  uploading?: boolean;
}

export function VerificationDialog({ open, onOpenChange, role }: VerificationDialogProps) {
  const { userId } = useAuth();
  const [files, setFiles] = useState<VerificationFile[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setFiles([]);
      setLinkUrl("");
      setLinkDescription("");
      setAdditionalInfo("");
      setSubmitSuccess(false);
      setErrorMessage(null);
    } else {
      // Clear messages when dialog opens
      setSubmitSuccess(false);
      setErrorMessage(null);
    }
  }, [open]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    uploadedFiles.forEach((file) => {
      const fileType = file.type.startsWith("image/") ? "image" : "pdf";
      const newFile: VerificationFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: fileType,
        file,
        uploaded: false,
        uploading: false,
      };
      setFiles((prev) => [...prev, newFile]);
    });
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    
    const newLink: VerificationFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: linkDescription || linkUrl,
      type: "link",
      url: linkUrl,
      description: linkDescription,
      uploaded: true, // Links don't need uploading
    };
    
    setFiles((prev) => [...prev, newLink]);
    setLinkUrl("");
    setLinkDescription("");
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const uploadSingleFileWithId = async (file: VerificationFile, requestId: number): Promise<boolean> => {
    if (!file.file) {
      return false;
    }

    setFiles((prev) => 
      prev.map((f) => 
        f.id === file.id ? { ...f, uploading: true } : f
      )
    );

    try {
      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('verificationRequestId', requestId.toString());
      if (file.description) {
        formData.append('description', file.description);
      }

      const response = await fetch('/api/verification/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      setFiles((prev) => 
        prev.map((f) => 
          f.id === file.id ? { ...f, uploading: false, uploaded: true } : f
        )
      );

      return true;
    } catch (error) {
      console.error('Error uploading file:', error);
      setFiles((prev) => 
        prev.map((f) => 
          f.id === file.id ? { ...f, uploading: false, uploaded: false } : f
        )
      );
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!userId) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // First, create the verification request
      const links = files
        .filter(f => f.type === "link")
        .map(f => ({
          url: f.url!,
          description: f.description,
        }));

      const submitResponse = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          additionalInfo,
          links,
        }),
      });

      if (!submitResponse.ok) {
        const error = await submitResponse.json();
        throw new Error(error.error || 'Failed to submit verification request');
      }

      const { verificationRequest } = await submitResponse.json();

      // Upload files if any
      const filesToUpload = files.filter(f => f.file && !f.uploaded);
      
      if (filesToUpload.length > 0) {
        // Upload files one by one
        for (const file of filesToUpload) {
          const uploadSuccess = await uploadSingleFileWithId(file, verificationRequest.id);
          if (!uploadSuccess) {
            throw new Error(`Failed to upload ${file.name}`);
          }
        }
      }

      // Success - show success message instead of closing immediately
      setSubmitSuccess(true);

    } catch (error) {
      console.error('Error submitting verification:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4" />;
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "link":
        return <Link className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const canSubmit = files.length > 0 && !isSubmitting;

  // Get role-specific content
  const getRoleContent = () => {
    switch (role) {
      case "athlete":
        return {
          title: "Get Verified as an Athlete",
          description: "Submit documentation to verify your athletic participation and build trust with coaches and recruiters.",
          proofList: [
            "• College/club team roster listing you as a player",
            "• Team website page showing you as a member",
            "• Official team ID or membership card",
            "• Game/tournament stats sheets with your name",
            "• Photos from official games or team events",
            "• Letter from coach or team coordinator",
            "• Intramural league registration or standings",
            "• Club sports registration documents"
          ],
          helpText: "This verification is for athletes playing club sports, intramurals, or college teams without MaxPreps profiles.",
        };
      case "coach":
        return {
          title: "Get Verified as a Coach",
          description: "Submit documentation to verify your credentials and build trust with athletes.",
          proofList: [
            "• Official school/program roster listing you as staff",
            "• Program website page showing your position",
            "• Official business card or ID badge",
            "• Letter of employment or contract (personal info can be redacted)",
            "• LinkedIn profile or official bio page"
          ],
          helpText: "This helps athletes know they're connecting with legitimate coaches.",
        };
      case "recruiter":
        return {
          title: "Get Verified as a Recruiter",
          description: "Submit documentation to verify your credentials and build trust with athletes.",
          proofList: [
            "• Official school/program roster listing you as staff",
            "• Program website page showing your position",
            "• Official business card or ID badge",
            "• Letter of employment or contract (personal info can be redacted)",
            "• LinkedIn profile or official bio page"
          ],
          helpText: "This helps athletes know they're connecting with legitimate recruiters.",
        };
    }
  };

  const roleContent = getRoleContent();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="break-words">{roleContent.title}</span>
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {roleContent.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* What to Submit Section */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 sm:p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">
              What can you submit as proof?
            </h4>
            <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 space-y-1">
              {roleContent.proofList.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            {role === "athlete" && (
              <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-200 font-medium">
                  💡 {roleContent.helpText}
                </p>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="file-upload" className="text-sm sm:text-base font-medium">
              Upload Documents or Images
            </Label>
            <div className="mt-2">
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
                capture="environment"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="w-full text-sm sm:text-base h-auto py-3 px-4"
                disabled={isSubmitting}
              >
                <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="break-words">Choose Files (PDF, Images)</span>
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Take photos or upload existing files (Max 10MB per file)
              </p>
            </div>
          </div>

          {/* Add Link */}
          <div>
            <Label className="text-sm sm:text-base font-medium">Add Website Links</Label>
            <div className="mt-2 space-y-3">
              <div>
                <Input
                  placeholder={role === "athlete" ? "https://example.com/team-roster" : "https://example.com/staff-directory"}
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full min-w-0 text-sm sm:text-base"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Input
                  placeholder={role === "athlete" ? "Description (e.g., 'College basketball roster page')" : "Description (e.g., 'School staff directory page')"}
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  className="w-full min-w-0 text-sm sm:text-base"
                  disabled={isSubmitting}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleAddLink}
                disabled={!linkUrl.trim() || isSubmitting}
                size="sm"
                className="text-sm"
              >
                <Link className="w-4 h-4 mr-2 flex-shrink-0" />
                Add Link
              </Button>
            </div>
          </div>

          {/* Submitted Files */}
          {files.length > 0 && (
            <div>
              <Label className="text-sm sm:text-base font-medium">Submitted Evidence</Label>
              <div className="mt-2 space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        {file.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {file.description}
                          </p>
                        )}
                        {file.uploading && (
                          <p className="text-xs text-blue-600">Uploading...</p>
                        )}
                        {file.uploaded && file.type !== "link" && (
                          <p className="text-xs text-green-600">Uploaded</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {file.type.toUpperCase()}
                        </Badge>
                        {file.uploaded && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(file.id)}
                      className="flex-shrink-0"
                      disabled={isSubmitting || file.uploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div>
            <Label htmlFor="additional-info" className="text-sm sm:text-base font-medium">
              Additional Information (Optional)
            </Label>
            <Textarea
              id="additional-info"
              placeholder={role === "athlete" 
                ? "Tell us about your athletic background, what sports you play, at what level, etc..."
                : "Any additional context or information that might help with verification..."
              }
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="mt-2 w-full min-w-0 text-sm sm:text-base"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Review Process Info */}
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm min-w-0">
                <p className="font-medium text-green-900 dark:text-green-100">
                  Review Process
                </p>
                <p className="text-green-800 dark:text-green-200 mt-1">
                  Our team will review your submission within 1-3 business days. 
                  You&apos;ll receive an email notification once your verification is complete.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm min-w-0">
                  <p className="font-medium text-red-900 dark:text-red-100">
                    Error
                  </p>
                  <p className="text-red-800 dark:text-red-200 mt-1">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {submitSuccess && (
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 sm:p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                    Verification Submitted Successfully! 🎉
                  </h3>
                  <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                    <p>
                      Thank you for submitting your verification request. Our team will carefully review your documentation.
                    </p>
                    <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-3 border border-green-200 dark:border-green-700">
                      <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                        ⏰ What happens next?
                      </p>
                      <ul className="text-green-800 dark:text-green-200 space-y-1">
                        <li>• We&apos;ll review your submission within 1-3 business days</li>
                        <li>• Once approved, a verified badge will appear on your profile</li>
                        <li>• This badge shows other users that you&apos;re a legitimate {role}</li>
                      </ul>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Your verification status will be updated automatically once our review is complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          {submitSuccess ? (
            <Button 
              onClick={() => {
                setSubmitSuccess(false);
                setFiles([]);
                setLinkUrl("");
                setLinkDescription("");
                setAdditionalInfo("");
                setErrorMessage(null);
                onOpenChange(false);
              }}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
            >
              Close
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 