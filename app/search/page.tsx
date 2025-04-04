import { Sidebar } from "@/components/sidebar"
import { TrendingPanel } from "@/components/trending-panel"
import { SearchInput } from "@/components/search-input"
import { SearchResults } from "@/components/search-results"

export default function SearchPage() {
  return (
    <main className="flex min-h-screen bg-white dark:bg-black">
      <Sidebar />
      <div className="flex-1 border-x border-gray-200 dark:border-gray-800 max-w-2xl">
        <h1 className="text-xl font-bold p-4 border-b border-gray-200 dark:border-gray-800">Search</h1>
        <SearchInput />
        <SearchResults />
      </div>
      <TrendingPanel />
    </main>
  )
}

