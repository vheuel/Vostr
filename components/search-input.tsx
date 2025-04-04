"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"

export function SearchInput() {
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would perform the search here
    console.log("Searching for:", query)
  }

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
        <Input placeholder="Search Nostr" className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
      </form>
    </div>
  )
}

