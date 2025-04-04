"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProfileTabsProps {
  pubkey: string
}

export function ProfileTabs({ pubkey }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="notes" className="w-full">
      <TabsList className="w-full grid grid-cols-4">
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="replies">Replies</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
        <TabsTrigger value="likes">Likes</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

