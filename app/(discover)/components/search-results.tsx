"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { UserCard } from './user-card';

// Types
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

interface SearchResultsProps {
  // State
  initialLoading: boolean;
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  hasMore: boolean;
  displayedUsers: DiscoverUser[];
  allUsers: DiscoverUser[];
  activeFiltersCount: number;
  
  // Actions
  clearFilters: () => void;
  loadUsers: (page: number, isNewSearch: boolean) => void;
  handleViewProfile: (userId: string) => void;
  generateProfileUrl: (user: DiscoverUser) => string;
  
  // Infinite scroll ref
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  initialLoading,
  loading,
  error,
  hasSearched,
  hasMore,
  displayedUsers,
  allUsers,
  activeFiltersCount,
  clearFilters,
  loadUsers,
  handleViewProfile,
  generateProfileUrl,
  loadMoreRef
}) => {
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01ae79]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => loadUsers(1, true)} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01ae79] mx-auto"></div>
      </div>
    );
  }

  if (displayedUsers.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
        <p className="text-muted-foreground mb-4">
          {activeFiltersCount > 0
            ? "Try adjusting your filters to see more results."
            : "No users are available to discover at the moment."
          }
        </p>
        {activeFiltersCount > 0 && (
          <Button onClick={clearFilters} variant="outline">
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {displayedUsers.length}
          {activeFiltersCount > 0 && (
            <span className="ml-2">
              • <span className="font-medium">{activeFiltersCount}</span> filter{activeFiltersCount !== 1 ? 's' : ''} applied
            </span>
          )}
        </p>
      </div>

      {/* User Grid - responsive columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 mb-8">
        {displayedUsers.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onViewProfile={handleViewProfile}
            generateProfileUrl={generateProfileUrl}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="text-center py-4"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#01ae79] mr-2"></div>
              <span className="text-muted-foreground">Loading more...</span>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Scroll down to load more</p>
          )}
        </div>
      )}

      {!hasMore && allUsers.length > 10 && (
        <div className="text-center py-4">
          <p className="text-muted-foreground text-sm">You&apos;ve reached the end!</p>
        </div>
      )}
    </>
  );
};