"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Search } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  displayName: string;
  welcomeText: string;
  searchText: string;
  searchHref: string;
  isAdmin: boolean;
  isViewingAsOtherRole: boolean;
  effectiveRole: string;
  isVerified?: boolean;
}

export function DashboardHeader({
  displayName,
  welcomeText,
  searchText,
  searchHref,
  isAdmin,
  isViewingAsOtherRole,
  effectiveRole,
  isVerified
}: DashboardHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Admin View Indicator */}
      {isAdmin && isViewingAsOtherRole && (
        <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <Eye className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700 dark:text-blue-200">
            <div className="flex items-center justify-between">
              <span>Admin Mode: You are viewing the dashboard as a <strong>{effectiveRole}</strong>. Use the role switcher to change perspectives.</span>
              {isVerified !== undefined && (
                <Badge variant="outline" className="ml-2">
                  {isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back, {displayName}!</h1>
          <p className="text-muted-foreground text-sm md:text-base">{welcomeText}</p>
        </div>
        
        <div className="flex gap-3">
          <Link href={searchHref}>
            <Button className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white gap-2">
              <Search className="w-4 h-4" />
              {searchText}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 