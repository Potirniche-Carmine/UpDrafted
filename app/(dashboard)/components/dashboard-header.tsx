"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  displayName: string;
  welcomeText: string;
  searchText: string;
  searchHref: string;
}

export function DashboardHeader({
  displayName,
  welcomeText,
  searchText,
  searchHref
}: DashboardHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Welcome back to UpDrafted</h1>
          <p className="text-muted-foreground text-base md:text-lg">{welcomeText}</p>
        </div>
        
        <div className="flex gap-3">
          <Link href={searchHref}>
            <Button className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white gap-2 text-base px-6 py-2.5">
              <Search className="w-5 h-5" />
              {searchText}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 