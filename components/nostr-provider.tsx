"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { SimplePool, getPublicKey, finalizeEvent } from "nostr-tools"
import { useToast } from "@/hooks/use-toast"

type NostrContextType = {
  pool: SimplePool | null
  publicKey: string | null
  relays: string[]
  login: (privateKey?: string) => void
  logout: () => void
  publishNote: (content: string) => Promise<void>
  publishReaction: (eventId: string, reaction: string) => Promise<void>
  publishRepost: (eventId: string) => Promise<void>
}

const NostrContext = createContext<NostrContextType>({
  pool: null,
  publicKey: null,
  relays: [],
  login: () => {},
  logout: () => {},
  publishNote: async () => {},
  publishReaction: async () => {},
  publishRepost: async () => {},
})

export function NostrProvider({ children }: { children: React.ReactNode }) {
  const [pool, setPool] = useState<SimplePool | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [privateKey, setPrivateKey] = useState<string | null>(null)
  const { toast } = useToast()

  // Update the relays list to use only the most reliable ones
  const relays = ["wss://relay.damus.io", "wss://nos.lol"]

  // Update the pool initialization with better error handling
  useEffect(() => {
    try {
      // Create a new pool with options for better error handling
      const newPool = new SimplePool({
        eoseSubTimeout: 3_000, // 3 seconds timeout for EOSE
        getTimeout: 3_000, // 3 seconds timeout for GET requests
      })

      setPool(newPool)

      // Check for existing login
      const storedPublicKey = document.cookie
        .split("; ")
        .find((row) => row.startsWith("nostr-public-key="))
        ?.split("=")[1]

      const storedPrivateKey = localStorage.getItem("nostr-private-key")

      if (storedPublicKey && storedPrivateKey) {
        setPublicKey(storedPublicKey)
        setPrivateKey(storedPrivateKey)
      }

      return () => {
        try {
          // Safely close the pool
          newPool.close(relays)
        } catch (error) {
          console.error("Error closing pool:", error)
        }
      }
    } catch (error) {
      console.error("Error initializing Nostr pool:", error)
      // Continue without a pool - the UI will handle this gracefully
    }
  }, [])

  const login = (inputPrivateKey?: string) => {
    try {
      let privKey = inputPrivateKey

      // Generate a new key if none provided
      if (!privKey) {
        privKey = window.crypto
          .getRandomValues(new Uint8Array(32))
          .reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")
      }

      const pubKey = getPublicKey(privKey)

      // Store keys
      document.cookie = `nostr-public-key=${pubKey}; path=/; max-age=2592000` // 30 days
      localStorage.setItem("nostr-private-key", privKey)

      setPublicKey(pubKey)
      setPrivateKey(privKey)

      toast({
        title: "Logged in successfully",
        description: "You are now connected to Nostr",
      })
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid private key",
        variant: "destructive",
      })
    }
  }

  const logout = () => {
    document.cookie = "nostr-public-key=; path=/; max-age=0"
    localStorage.removeItem("nostr-private-key")
    setPublicKey(null)
    setPrivateKey(null)

    toast({
      title: "Logged out",
      description: "You have been disconnected from Nostr",
    })
  }

  const publishNote = async (content: string) => {
    if (!pool || !publicKey || !privateKey) {
      toast({
        title: "Not logged in",
        description: "Please log in to publish notes",
        variant: "destructive",
      })
      return
    }

    try {
      const event = {
        kind: 1,
        pubkey: publicKey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content,
      }

      // Finalize the event with the private key
      const signedEvent = finalizeEvent(event, privateKey)

      await pool.publish(relays, signedEvent)

      toast({
        title: "Note published",
        description: "Your note has been published to Nostr",
      })
    } catch (error) {
      toast({
        title: "Failed to publish note",
        description: "An error occurred while publishing your note",
        variant: "destructive",
      })
    }
  }

  const publishReaction = async (eventId: string, reaction: string) => {
    if (!pool || !publicKey || !privateKey) {
      toast({
        title: "Not logged in",
        description: "Please log in to react to notes",
        variant: "destructive",
      })
      return
    }

    try {
      const event = {
        kind: 7,
        pubkey: publicKey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["e", eventId]],
        content: reaction,
      }

      // Finalize the event with the private key
      const signedEvent = finalizeEvent(event, privateKey)

      await pool.publish(relays, signedEvent)

      toast({
        title: "Reaction published",
        description: "Your reaction has been published to Nostr",
      })
    } catch (error) {
      toast({
        title: "Failed to publish reaction",
        description: "An error occurred while publishing your reaction",
        variant: "destructive",
      })
    }
  }

  const publishRepost = async (eventId: string) => {
    if (!pool || !publicKey || !privateKey) {
      toast({
        title: "Not logged in",
        description: "Please log in to repost notes",
        variant: "destructive",
      })
      return
    }

    try {
      const event = {
        kind: 6,
        pubkey: publicKey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["e", eventId]],
        content: "",
      }

      // Finalize the event with the private key
      const signedEvent = finalizeEvent(event, privateKey)

      await pool.publish(relays, signedEvent)

      toast({
        title: "Repost published",
        description: "Your repost has been published to Nostr",
      })
    } catch (error) {
      toast({
        title: "Failed to publish repost",
        description: "An error occurred while publishing your repost",
        variant: "destructive",
      })
    }
  }

  return (
    <NostrContext.Provider
      value={{
        pool,
        publicKey,
        relays,
        login,
        logout,
        publishNote,
        publishReaction,
        publishRepost,
      }}
    >
      {children}
    </NostrContext.Provider>
  )
}

export const useNostr = () => useContext(NostrContext)

