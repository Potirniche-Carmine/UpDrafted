"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Plus, 
  Edit,
  BookOpen,
  Award,
  Target
} from "lucide-react";

interface AcademicSummaryCardProps {
  gpa?: number | string;
  satScore?: number;
  actScore?: number;
  intendedMajor?: string;
  isOwnProfile: boolean;
  onEditSection: (section: string) => void;
}

// Helper function to safely format GPA
const formatGPA = (gpa: number | string | undefined): string => {
  if (!gpa) return '';
  const numericGPA = typeof gpa === 'number' ? gpa : parseFloat(gpa);
  return isNaN(numericGPA) ? gpa.toString() : numericGPA.toFixed(2);
};

export function AcademicSummaryCard({ 
  gpa, 
  satScore, 
  actScore, 
  intendedMajor, 
  isOwnProfile, 
  onEditSection 
}: AcademicSummaryCardProps) {
  const hasAnyAcademicInfo = gpa || satScore || actScore || intendedMajor;

  if (!hasAnyAcademicInfo && !isOwnProfile) {
    return null; // Don't show to other users if no academic info
  }

  if (!hasAnyAcademicInfo && isOwnProfile) {
    return (
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:border-amber-800 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                <GraduationCap className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Academic Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Showcase your academic achievements to coaches
                </p>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
              <BookOpen className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h4 className="font-medium mb-2">Add Your Academic Stats</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Strong academics can set you apart. Add your GPA, test scores, and intended major.
              </p>
              <Button 
                size="sm"
                onClick={() => onEditSection('academic-info')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Academic Info
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Academic Profile</h3>
              </div>
            </div>
            {isOwnProfile && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onEditSection('academic-info')}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Academic Stats - Redesigned for better centering */}
          <div className="space-y-4">
            {/* Test Scores Row */}
            {(gpa || satScore || actScore) && (
              <div className="flex justify-center">
                <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                  {gpa && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#01ae79]">
                        {formatGPA(gpa)}
                      </div>
                      <div className="text-xs text-muted-foreground">GPA</div>
                    </div>
                  )}
                  {satScore && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{satScore}</div>
                      <div className="text-xs text-muted-foreground">SAT</div>
                    </div>
                  )}
                  {actScore && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{actScore}</div>
                      <div className="text-xs text-muted-foreground">ACT</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Separator when both sections exist */}
            {(gpa || satScore || actScore) && intendedMajor && (
              <div className="flex justify-center">
                <div className="w-12 h-px bg-border"></div>
              </div>
            )}

            {/* Intended Major Row - Always centered */}
            {intendedMajor && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {intendedMajor.includes(',') || intendedMajor.includes(' and ') || intendedMajor.includes('/') 
                      ? 'Intended Majors' 
                      : 'Intended Major'}
                  </span>
                </div>
                <div className="font-medium text-sm leading-relaxed max-w-sm mx-auto break-words">
                  {intendedMajor}
                </div>
              </div>
            )}
          </div>

          {/* Add missing info prompt */}
          {isOwnProfile && (!gpa || (!satScore && !actScore) || !intendedMajor) && (
            <div className="pt-2 border-t border-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="w-4 h-4" />
                <span>
                  Add {[
                    !gpa && 'GPA',
                    !satScore && !actScore && 'test scores',
                    !intendedMajor && 'intended major'
                  ].filter(Boolean).join(', ')} to strengthen your profile
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 