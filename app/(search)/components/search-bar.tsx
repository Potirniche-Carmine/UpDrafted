"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input"; 
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Show/hide dropdown based on search term length
  useEffect(() => {
    setIsOpen(searchTerm.length >= 4);
  }, [searchTerm.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.length >= 4) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.length >= 4) {
      e.preventDefault();
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSearch}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search athletes, coaches, recruiters..."
          className="w-full rounded-lg bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-background border-border/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </form>
      
      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {/* Search for query option */}
            <Link 
              href={`/search?q=${encodeURIComponent(searchTerm)}`}
              className="block w-full p-3 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium hover:bg-green-50/50 dark:hover:bg-green-950/20 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Search for &ldquo;{searchTerm}&rdquo;</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
