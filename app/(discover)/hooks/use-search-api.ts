"use client";

import { useCallback } from "react";
import { sanitizeText } from '@/utils/sanitization';

import type { FilterOption } from './use-filter-options';

interface DiscoverUser {
  id: string;
  fullName: string;
  organizationName: string;
  profileImage: string | null;
  city: string;
  state: string;
  country?: string;
  isVerified: boolean;
  role: 'athlete' | 'coach' | 'recruiter';
  sport: string;
  title?: string;
  division?: string;
  educationLevel?: string;
  hasPendingRequest: boolean;
  hasIncomingRequest: boolean;
  graduationYear?: number;
  height?: string;
  weight?: string;
  positions?: string[];
  recruitingNeeds?: {
    studentClassifications: string[];
    positions: string[];
    scholarshipsAvailable: number | null;
  } | null;
}

interface DiscoverResponse {
  results: DiscoverUser[];
  total: number;
  hasMore: boolean;
}

interface UseSearchAPIProps {
  effectiveRole: string;
  selectedSports: FilterOption[];
  selectedDivisions: FilterOption[];
  selectedCountries: FilterOption[];
  selectedStates: FilterOption[];
  selectedPositions: FilterOption[];
  selectedGraduatingClasses: FilterOption[];
  selectedConferences: FilterOption[];
  minHeight: number;
  minWeight: number;
  verifiedFilter: boolean | null;
  showStatesFilter: boolean;
  setAllUsers: (users: DiscoverUser[] | ((prev: DiscoverUser[]) => DiscoverUser[])) => void;
  setHasSearched: (searched: boolean) => void;
  setPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setLoading: (loading: boolean) => void;
  setInitialLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSearchAPI = ({
  effectiveRole,
  selectedSports,
  selectedDivisions,
  selectedCountries,
  selectedStates,
  selectedPositions,
  selectedGraduatingClasses,
  selectedConferences,
  minHeight,
  minWeight,
  verifiedFilter,
  showStatesFilter,
  setAllUsers,
  setHasSearched,
  setPage,
  setHasMore,
  setLoading,
  setInitialLoading,
  setError,
}: UseSearchAPIProps) => {

  // Load users function - only called when discover button is clicked
  const loadUsers = useCallback(async (pageNum: number, isNewSearch = false) => {
    try {
      if (isNewSearch) {
        setInitialLoading(true);
        setAllUsers([]); // Clear previous results
        setHasSearched(true);
        setPage(2); // Set to 2 since we're loading page 1, next load will be page 2
      } else {
        setLoading(true);
      }
      setError(null);



      // Prepare the search parameters - use 1 for new search, pageNum for pagination
      const actualPage = isNewSearch ? 1 : pageNum;
      const searchParams = {
        page: actualPage.toString(),
        pageSize: '10', // Show 10 profiles per load
        sports: selectedSports.map(sport => sanitizeText(sport.value)),
        divisions: selectedDivisions.map(div => sanitizeText(div.value)),
        countries: selectedCountries.map(country => sanitizeText(country.value)),
        states: showStatesFilter ? selectedStates.map(state => sanitizeText(state.value)) : [],
        positions: effectiveRole !== 'athlete' ? selectedPositions.map(pos => sanitizeText(pos.value)) : [],
        graduatingClasses: effectiveRole !== 'athlete' ? selectedGraduatingClasses.map(gc => sanitizeText(gc.value)) : [],
        conferences: selectedConferences.map(conf => sanitizeText(conf.value)),
        minHeight: effectiveRole !== 'athlete' ? minHeight.toString() : '48',
        minWeight: effectiveRole !== 'athlete' ? minWeight.toString() : '0',
        verified: verifiedFilter
      };

      // Calculate approximate URL length if we were to use GET
      const params = new URLSearchParams({
        page: searchParams.page,
        pageSize: searchParams.pageSize
      });

      searchParams.sports.forEach(sport => params.append('sports', sport));
      searchParams.divisions.forEach(div => params.append('divisions', div));
      searchParams.countries.forEach(country => params.append('countries', country));
      if (showStatesFilter) {
        searchParams.states.forEach(state => params.append('states', state));
      }
      searchParams.positions.forEach(pos => params.append('positions', pos));
      searchParams.graduatingClasses.forEach(gc => params.append('graduatingClasses', gc));
      searchParams.conferences.forEach(conf => params.append('conferences', conf));
      if (minHeight > 48) params.append('minHeight', searchParams.minHeight);
      if (minWeight > 50) params.append('minWeight', searchParams.minWeight);
      if (verifiedFilter !== null) params.append('verified', verifiedFilter.toString());

      const baseUrl = '/api/discover';
      const estimatedUrlLength = baseUrl.length + params.toString().length + 1; // +1 for '?'

      // Use POST if URL would be too long (> 3000 chars to be safe)
      const usePost = estimatedUrlLength > 3000;

      let response: Response;

      // Helper to send POST request (avoids duplication)
      const requestWithPost = async () =>
        fetch('/api/discover', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            page: actualPage,
            pageSize: 10,
            sports: selectedSports.map(sport => sanitizeText(sport.value)),
            divisions: selectedDivisions.map(div => sanitizeText(div.value)),
            countries: selectedCountries.map(country => sanitizeText(country.value)),
            states: showStatesFilter ? selectedStates.map(state => sanitizeText(state.value)) : [],
            positions: effectiveRole !== 'athlete' ? selectedPositions.map(pos => sanitizeText(pos.value)) : [],
            graduatingClasses: effectiveRole !== 'athlete' ? selectedGraduatingClasses.map(gc => sanitizeText(gc.value)) : [],
            conferences: selectedConferences.map(conf => sanitizeText(conf.value)),
            minHeight: effectiveRole !== 'athlete' && minHeight > 48 ? minHeight : undefined,
            minWeight: effectiveRole !== 'athlete' && minWeight > 50 ? minWeight : undefined,
            verified: verifiedFilter
          })
        });

      // Helper to produce better error messages
      const ensureOk = async (res: Response) => {
        if (res.ok) return;
        const data = await res.json().catch(() => ({}));
        const message = data?.error || data?.message || 'Failed to load users';
        throw new Error(message);
      };

      if (usePost) {
        // Use POST request for large filter sets
        response = await requestWithPost();
      } else {
        // Use GET request for smaller filter sets
        response = await fetch(`${baseUrl}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
        });
      }

      if (!response.ok) {
        // Check if it's a URL too long error and retry with POST
        if (response.status === 414 && !usePost) {
          response = await requestWithPost();
          if (!response.ok) {
            await ensureOk(response);
          }
        } else {
          await ensureOk(response);
        }
      }

      const data: DiscoverResponse = await response.json();

      if (isNewSearch) {
        setAllUsers(data.results);
        // Page is already set to 2 at the beginning of the function (ready for next load)
      } else {
        // Use a Set to prevent duplicates based on user ID
        setAllUsers(prev => {
          const existingIds = new Set(prev.map(u => u.id));
          const newUsers = data.results.filter(u => !existingIds.has(u.id));
          return [...prev, ...newUsers];
        });
        setPage(pageNum + 1); // Update page for next load
      }

      setHasMore(data.results.length === 10); // If we got less than 10, no more pages

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [
    selectedSports,
    selectedDivisions,
    selectedCountries,
    selectedStates,
    selectedPositions,
    selectedGraduatingClasses,
    selectedConferences,
    minHeight,
    minWeight,
    verifiedFilter,
    showStatesFilter,
    effectiveRole,
    setAllUsers,
    setHasSearched,
    setPage,
    setHasMore,
    setLoading,
    setInitialLoading,
    setError
  ]);

  return {
    loadUsers
  };
};