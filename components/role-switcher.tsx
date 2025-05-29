"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, Shield, CheckCircle, Settings, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";

type ViewRole = 'athlete' | 'coach' | 'recruiter';

export function RoleSwitcher() {
  const { user } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const isAdmin = user?.publicMetadata?.role === 'admin';

  if (!isAdmin) {
    return null;
  }

  const handleRoleChange = (role: ViewRole) => {
    // Store the viewing role in session storage so other components can access it
    sessionStorage.setItem('adminViewingAs', role);
    // Trigger a page refresh to apply the new perspective
    window.location.reload();
  };

  const handleVerificationChange = (isVerified: boolean) => {
    // Store the verification status in session storage
    sessionStorage.setItem('adminVerificationStatus', isVerified.toString());
    // Trigger a page refresh to apply the new verification state
    window.location.reload();
  };

  // Get the current viewing role from session storage on load
  const getCurrentViewingRole = (): ViewRole => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem('adminViewingAs') as ViewRole) || 'athlete';
    }
    return 'athlete';
  };

  // Get the current verification status from session storage
  const getCurrentVerificationStatus = (): boolean => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('adminVerificationStatus');
      return stored === 'true';
    }
    return false;
  };

  const currentRole = getCurrentViewingRole();
  const isVerified = getCurrentVerificationStatus();

  // Collapsed state - small floating button
  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          size="sm"
          className="h-10 w-10 rounded-full shadow-lg bg-primary hover:bg-primary/90 p-0"
          title="Admin Testing Mode"
        >
          <Settings className="h-4 w-4" />
        </Button>
        {/* Small indicator showing current role */}
        <div className="absolute -top-2 -left-2">
          <Badge variant="outline" className="text-xs bg-background">
            {currentRole.charAt(0).toUpperCase()}
          </Badge>
        </div>
      </div>
    );
  }

  // Expanded state - full panel
  return (
    <Card className="fixed bottom-4 right-4 w-80 max-w-[calc(100vw-2rem)] shadow-lg border-primary/20 z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Admin Testing Mode</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          View the site from different user perspectives
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Currently viewing as:</span>
          <Badge variant="outline" className="text-xs">
            {currentRole}
          </Badge>
        </div>
        
        {/* Role Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Role</Label>
          <Select onValueChange={handleRoleChange} defaultValue={currentRole}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role to view as" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="athlete">Athlete</SelectItem>
              <SelectItem value="coach">Coach</SelectItem>
              <SelectItem value="recruiter">Recruiter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Verification Status Toggle */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Verification Status</Label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Verified Account</span>
            </div>
            <Switch
              checked={isVerified}
              onCheckedChange={handleVerificationChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isVerified ? "default" : "secondary"} className="text-xs">
              {isVerified ? "Verified" : "Unverified"}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          This affects how the interface appears and what content is visible.
        </p>
      </CardContent>
    </Card>
  );
} 