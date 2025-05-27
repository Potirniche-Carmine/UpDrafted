'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useState, useEffect } from 'react'

export const SearchUsers = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const currentSearch = urlParams.get('search')
    if (currentSearch) {
      setSearchTerm(currentSearch)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    
    const params = new URLSearchParams(window.location.search)
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim())
    } else {
      params.delete('search')
    }
    
    router.push(pathname + '?' + params.toString())
    
    // Reset loading state after a short delay
    setTimeout(() => setIsSearching(false), 500)
  }

  const handleClear = () => {
    setSearchTerm('')
    const params = new URLSearchParams(window.location.search)
    params.delete('search')
    router.push(pathname + '?' + params.toString())
  }

  return (
    <div className="space-y-2">
      <label htmlFor="search" className="text-sm font-medium text-foreground">
        Search Users
      </label>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            name="search"
            type="text"
            placeholder="Search by name, email, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 bg-background border-border focus:border-primary focus:ring-primary"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button 
          type="submit" 
          disabled={isSearching}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
        >
          {isSearching ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Searching...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </div>
          )}
        </Button>
      </form>
      {searchTerm && (
        <p className="text-xs text-muted-foreground">
          Searching for: <span className="font-medium text-foreground">"{searchTerm}"</span>
        </p>
      )}
    </div>
  )
}