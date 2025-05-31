"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  Plus, 
  Edit, 
  Timer, 
  Target,
  TrendingUp,
  Award,
  Zap,
  Save,
  X
} from "lucide-react";
import { Measurable } from '@/app/(profiles)/components/athlete-profile';
import { getMeasurablesForSport } from '@/lib/sports-data';

interface AthleticHighlightsSectionProps {
  measurables?: Measurable[];
  selectedSport: string;
  isOwnProfile: boolean;
  onEditSection: (section: string) => void;
}

const getMeasurableIcon = (label: string) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('dash') || lowerLabel.includes('speed') || lowerLabel.includes('sprint')) return Timer;
  if (lowerLabel.includes('jump') || lowerLabel.includes('vertical')) return TrendingUp;
  if (lowerLabel.includes('strength') || lowerLabel.includes('bench') || lowerLabel.includes('squat')) return Zap;
  if (lowerLabel.includes('points') || lowerLabel.includes('goals') || lowerLabel.includes('wins') || lowerLabel.includes('score')) return Award;
  return Target;
};

const getPlaceholderForMetric = (metricName: string): string => {
  if (!metricName) return "Enter value";
  
  const lowerMetric = metricName.toLowerCase();
  
  // Time-based metrics
  if (lowerMetric.includes('dash') || lowerMetric.includes('time') || lowerMetric.includes('split')) {
    return "e.g., 4.5s";
  }
  
  // Distance metrics
  if (lowerMetric.includes('jump') || lowerMetric.includes('distance') || lowerMetric.includes('throw')) {
    return "e.g., 6'2\"";
  }
  
  // Speed metrics
  if (lowerMetric.includes('speed') || lowerMetric.includes('velocity')) {
    return "e.g., 85 mph";
  }
  
  // Percentage metrics
  if (lowerMetric.includes('%') || lowerMetric.includes('percentage') || lowerMetric.includes('accuracy')) {
    return "e.g., 85%";
  }
  
  // Weight/strength metrics
  if (lowerMetric.includes('press') || lowerMetric.includes('squat') || lowerMetric.includes('weight')) {
    return "e.g., 225 lbs";
  }
  
  // Game stats
  if (lowerMetric.includes('points') || lowerMetric.includes('goals') || lowerMetric.includes('assists')) {
    return "e.g., 15.2";
  }
  
  // Scores
  if (lowerMetric.includes('score')) {
    return "e.g., 9.5";
  }
  
  // Default
  return "Enter value";
};

export function AthleticHighlightsSection({ measurables = [], selectedSport, isOwnProfile, onEditSection }: AthleticHighlightsSectionProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newMeasurable, setNewMeasurable] = useState({
    label: '',
    value: '',
    customLabel: '',
    isCustom: false
  });

  const sportMeasurables = measurables.filter(m => m.sport === selectedSport);
  const suggestedMeasurables = getMeasurablesForSport(selectedSport);

  const handleAddMeasurable = () => {
    console.log('Adding measurable:', newMeasurable);
    // TODO: Implement actual add functionality
    setEditDialogOpen(false);
    setNewMeasurable({ label: '', value: '', customLabel: '', isCustom: false });
  };

  const handleEditMeasurable = (measurable: Measurable) => {
    console.log('Editing measurable:', measurable);
    // TODO: Implement edit functionality
  };

  const handleDeleteMeasurable = (id: string) => {
    console.log('Deleting measurable:', id);
    // TODO: Implement delete functionality
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
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs px-2 py-1"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Performance Metric - {selectedSport}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="metric-type">Metric Type</Label>
                      <Select
                        value={newMeasurable.isCustom ? 'custom' : newMeasurable.label}
                        onValueChange={(value) => {
                          if (value === 'custom') {
                            setNewMeasurable(prev => ({ ...prev, isCustom: true, label: '' }));
                          } else {
                            setNewMeasurable(prev => ({ ...prev, isCustom: false, label: value }));
                          }
                        }}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Choose a metric" />
                        </SelectTrigger>
                        <SelectContent>
                          {suggestedMeasurables.map((metric) => (
                            <SelectItem key={metric} value={metric}>
                              {metric}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom Metric</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {newMeasurable.isCustom && (
                      <div className="space-y-2">
                        <Label htmlFor="custom-label">Custom Metric Name</Label>
                        <Input
                          id="custom-label"
                          placeholder="Enter name of metric"
                          value={newMeasurable.customLabel}
                          onChange={(e) => setNewMeasurable(prev => ({ ...prev, customLabel: e.target.value }))}
                          className="h-12"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="metric-value">Value</Label>
                      <Input
                        id="metric-value"
                        placeholder={getPlaceholderForMetric(newMeasurable.isCustom ? newMeasurable.customLabel : newMeasurable.label)}
                        value={newMeasurable.value}
                        onChange={(e) => setNewMeasurable(prev => ({ ...prev, value: e.target.value }))}
                        className="h-12"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddMeasurable}
                      disabled={!newMeasurable.value || (!newMeasurable.label && !newMeasurable.customLabel)}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Metric
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="mb-4"
                          size="default"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Performance Metric
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add Performance Metric - {selectedSport}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="metric-type">Metric Type</Label>
                            <Select
                              value={newMeasurable.isCustom ? 'custom' : newMeasurable.label}
                              onValueChange={(value) => {
                                if (value === 'custom') {
                                  setNewMeasurable(prev => ({ ...prev, isCustom: true, label: '' }));
                                } else {
                                  setNewMeasurable(prev => ({ ...prev, isCustom: false, label: value }));
                                }
                              }}
                            >
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Choose a metric" />
                              </SelectTrigger>
                              <SelectContent>
                                {suggestedMeasurables.map((metric) => (
                                  <SelectItem key={metric} value={metric}>
                                    {metric}
                                  </SelectItem>
                                ))}
                                <SelectItem value="custom">Custom Metric</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {newMeasurable.isCustom && (
                            <div className="space-y-2">
                              <Label htmlFor="custom-label">Custom Metric Name</Label>
                              <Input
                                id="custom-label"
                                placeholder="Enter name of metric"
                                value={newMeasurable.customLabel}
                                onChange={(e) => setNewMeasurable(prev => ({ ...prev, customLabel: e.target.value }))}
                                className="h-12"
                              />
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <Label htmlFor="metric-value">Value</Label>
                            <Input
                              id="metric-value"
                              placeholder={getPlaceholderForMetric(newMeasurable.isCustom ? newMeasurable.customLabel : newMeasurable.label)}
                              value={newMeasurable.value}
                              onChange={(e) => setNewMeasurable(prev => ({ ...prev, value: e.target.value }))}
                              className="h-12"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleAddMeasurable}
                            disabled={!newMeasurable.value || (!newMeasurable.label && !newMeasurable.customLabel)}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Metric
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
                        setNewMeasurable(prev => ({ ...prev, label: measurable, isCustom: false }));
                        setEditDialogOpen(true);
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
              variant="ghost"
              onClick={() => onEditSection('measurables')}
              className="text-xs px-2 py-1"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
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
                        onClick={() => handleEditMeasurable(measurable)}
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

        {/* Add More Button */}
        {isOwnProfile && (
          <div className="mt-4 pt-4 border-t border-muted/50">
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add More Performance Metrics
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Performance Metric - {selectedSport}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="metric-type">Metric Type</Label>
                    <Select
                      value={newMeasurable.isCustom ? 'custom' : newMeasurable.label}
                      onValueChange={(value) => {
                        if (value === 'custom') {
                          setNewMeasurable(prev => ({ ...prev, isCustom: true, label: '' }));
                        } else {
                          setNewMeasurable(prev => ({ ...prev, isCustom: false, label: value }));
                        }
                      }}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choose a metric" />
                      </SelectTrigger>
                      <SelectContent>
                        {suggestedMeasurables.map((metric) => (
                          <SelectItem key={metric} value={metric}>
                            {metric}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom Metric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newMeasurable.isCustom && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-label">Custom Metric Name</Label>
                      <Input
                        id="custom-label"
                        placeholder="Enter name of metric"
                        value={newMeasurable.customLabel}
                        onChange={(e) => setNewMeasurable(prev => ({ ...prev, customLabel: e.target.value }))}
                        className="h-12"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="metric-value">Value</Label>
                    <Input
                      id="metric-value"
                      placeholder={getPlaceholderForMetric(newMeasurable.isCustom ? newMeasurable.customLabel : newMeasurable.label)}
                      value={newMeasurable.value}
                      onChange={(e) => setNewMeasurable(prev => ({ ...prev, value: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddMeasurable}
                    disabled={!newMeasurable.value || (!newMeasurable.label && !newMeasurable.customLabel)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Metric
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 