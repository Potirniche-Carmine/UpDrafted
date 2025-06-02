"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Trophy, 
  Timer, 
  Zap, 
  Target, 
  Plus,
  Edit,
  X
} from "lucide-react";
import { getMeasurablesForSport } from '@/lib/sports-data';
import { Measurable } from '@/app/(profiles)/components/athlete-profile';

interface AthleticHighlightsSectionProps {
  measurables?: Measurable[];
  selectedSport: string;
  isOwnProfile: boolean;
  onEditSection: (section: string, measurableId?: string) => void;
}

// Sport-specific performance metrics to icon mapping
const getMeasurableIcon = (label: string) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('dash') || lowerLabel.includes('sprint') || lowerLabel.includes('speed')) return Timer;
  if (lowerLabel.includes('jump') || lowerLabel.includes('vertical') || lowerLabel.includes('broad')) return Zap;
  if (lowerLabel.includes('throw') || lowerLabel.includes('shot') || lowerLabel.includes('distance')) return Target;
  return Trophy;
};

export function AthleticHighlightsSection({ measurables = [], selectedSport, isOwnProfile, onEditSection }: AthleticHighlightsSectionProps) {
  const sportMeasurables = measurables.filter(m => m.sport === selectedSport);
  const suggestedMeasurables = getMeasurablesForSport(selectedSport);

  const handleAddMeasurable = () => {
    onEditSection('add-measurables');
  };

  const handleEditMeasurable = (measurableId: string) => {
    onEditSection('edit-measurable', measurableId);
  };

  const handleDeleteMeasurable = (measurableId: string) => {
    onEditSection('delete-measurable', measurableId);
  };

  if (sportMeasurables.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Athletic Performance - {selectedSport}
            </CardTitle>
            {isOwnProfile && (
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs px-2 py-1"
                onClick={handleAddMeasurable}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Empty State with Motivation */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-blue-600" />
              </div>
              
              {isOwnProfile ? (
                <>
                  <h3 className="font-semibold text-lg mb-2">Showcase Your Athletic Performance</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Add your performance metrics to stand out to coaches. Athletes with measurables are 
                    <span className="font-semibold text-blue-600"> 3x more likely</span> to get recruited.
                  </p>
                  <div className="flex justify-center">
                    <Button 
                      className="mb-4"
                      size="default"
                      onClick={handleAddMeasurable}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Performance Metric
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-lg mb-2">Performance Metrics</h3>
                  <p className="text-muted-foreground">
                    Athletic performance data will be displayed here when available.
                  </p>
                </>
              )}
            </div>

            {/* Suggested Measurables */}
            {isOwnProfile && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Popular {selectedSport} Metrics:</h4>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {suggestedMeasurables.slice(0, 8).map((measurable) => (
                    <Badge 
                      key={measurable} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 text-xs"
                      onClick={() => {
                        onEditSection('add-measurables');
                      }}
                    >
                      {measurable}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Athletic Performance - {selectedSport}
          </CardTitle>
          {isOwnProfile && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onEditSection('add-measurables')}
              className="text-xs px-2 py-1"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sportMeasurables.map((measurable) => {
            const Icon = getMeasurableIcon(measurable.label);
            return (
              <div key={measurable.id} className="bg-gradient-to-br from-muted/30 to-muted/50 rounded-lg p-4 border border-muted/50 relative group">
                {isOwnProfile && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleEditMeasurable(measurable.id)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteMeasurable(measurable.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex items-start justify-between mb-2 pr-12">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-muted-foreground">{measurable.label}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(measurable.measurementDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-foreground">{measurable.value}</div>
              </div>
            );
          })}
        </div>

        {/* Add More Button for own profile */}
        {isOwnProfile && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEditSection('add-measurables')}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add More Metrics
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 