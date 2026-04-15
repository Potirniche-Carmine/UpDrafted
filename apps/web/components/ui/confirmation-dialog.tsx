"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";

type ConfirmationVariant = "warning" | "danger" | "info" | "success";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

const variantConfig = {
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-600",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700"
  },
  danger: {
    icon: XCircle,
    iconColor: "text-red-600",
    buttonColor: "bg-red-600 hover:bg-red-700"
  },
  info: {
    icon: Info,
    iconColor: "text-blue-600",
    buttonColor: "bg-blue-600 hover:bg-blue-700"
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-600",
    buttonColor: "bg-green-600 hover:bg-green-700"
  }
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  onConfirm,
  onCancel,
  loading = false
}: ConfirmationDialogProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-gray-100 ${config.iconColor}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base mt-2 ml-12">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 text-white ${config.buttonColor}`}
          >
            {loading ? "Loading..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 