"use client";

import { useMemo } from "react";
import { DIVISIONS, US_STATES, COUNTRIES, getPositionsForSport } from '@/lib/sports-data';
import { CONFERENCES_BY_DIVISION } from '@/lib/conference-data';

export interface FilterOption {
  value: string;
  label: string;
}

// Ordered divisions with High School first (most common)
const ORDERED_DIVISIONS = ['High School', ...DIVISIONS.filter(d => d !== 'High School')];

// Generate graduation year options
const getGraduationYearOptions = (): FilterOption[] => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i <= 6; i++) {
    years.push({
      value: (currentYear + i).toString(),
      label: `Class of ${currentYear + i}`
    });
  }
  return years;
};

// Get conferences for selected divisions
const getConferencesForDivisions = (selectedDivisions: FilterOption[]): FilterOption[] => {
  // Don't show conferences for High School division
  const eligibleDivisions = selectedDivisions.filter(div => div.value !== 'High School');
  
  // If no eligible divisions are selected, return empty array (don't show all conferences)
  if (eligibleDivisions.length === 0) {
    return [];
  }
  
  const conferences = new Set<string>();
  eligibleDivisions.forEach(division => {
    const divisionConfs = CONFERENCES_BY_DIVISION[division.value] || [];
    divisionConfs.forEach(conf => conferences.add(conf));
  });
  
  return Array.from(conferences)
    .map(conf => ({ value: conf, label: conf }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

// Get positions for selected sports
const getPositionsForSports = (selectedSports: FilterOption[]): FilterOption[] => {
  if (selectedSports.length === 0) return [];
  
  const positions = new Set<string>();
  selectedSports.forEach(sport => {
    const sportPositions = getPositionsForSport(sport.value);
    sportPositions.forEach(pos => positions.add(pos));
  });
  
  return Array.from(positions)
    .map(pos => ({ value: pos, label: pos }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

interface UseFilterOptionsProps {
  selectedSports: FilterOption[];
  selectedDivisions: FilterOption[];
  selectedCountries: FilterOption[];
}

export const useFilterOptions = ({ 
  selectedSports, 
  selectedDivisions, 
  selectedCountries 
}: UseFilterOptionsProps) => {
  // Base filter options (sports are now handled by categorized SportFilter component)

  const divisionsOptions = useMemo(() =>
    ORDERED_DIVISIONS.map((division: string) => ({
      value: division,
      label: division
    }))
  , []);

  const statesOptions = useMemo(() =>
    US_STATES.map(state => ({
      value: state,
      label: state
    }))
  , []);

  const countryOptions = useMemo(() =>
    COUNTRIES.map(country => ({
      value: country,
      label: country
    }))
  , []);

  // Dynamic filter options based on selections
  const showStatesFilter = useMemo(() =>
    selectedCountries.some(country => country.value === 'United States')
  , [selectedCountries]);

  const positionsOptions = useMemo(() =>
    getPositionsForSports(selectedSports)
  , [selectedSports]);

  const graduatingClassOptions = useMemo(() =>
    getGraduationYearOptions()
  , []);

  const conferencesOptions = useMemo(() =>
    getConferencesForDivisions(selectedDivisions)
  , [selectedDivisions]);

  return {
    divisionsOptions,
    statesOptions,
    countryOptions,
    showStatesFilter,
    positionsOptions,
    graduatingClassOptions,
    conferencesOptions
  };
};