"use client"

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
}

const NostrContext = createContext<NostrContextType>({
  pool: null,
  publicKey: null,
  relays: [],
  login: () => {},
  logout: () => {},
  publishNote: async () => {},
})

export function NostrProvider({ children }: { children: React.ReactNode }) {
  const [pool, setPool] = useState<SimplePool | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [privateKey, setPrivateKey] = useState<string | null>(null)
  const { toast } = useToast()

  const relays = ["wss://relay.damus.io", "wss://nos.lol"]

  useEffect(() => {
    const newPool = new SimplePool()
    setPool(newPool)

    const storedPublicKey = localStorage.getItem("nostr-public-key")
    const storedPrivateKey = localStorage.getItem("nostr-private-key")

    if (storedPublicKey && storedPrivateKey) {
      setPublicKey(storedPublicKey)
      setPrivateKey(storedPrivateKey)
    }

    return () => newPool.close(relays)
  }, [])

  const login = (inputPrivateKey?: string) => {
    let privKey = inputPrivateKey || window.crypto.getRandomValues(new Uint8Array(32)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")
    const pubKey = getPublicKey(privKey)

    localStorage.setItem("nostr-public-key", pubKey)
    localStorage.setItem("nostr-private-key", privKey)
    setPublicKey(pubKey)
    setPrivateKey(privKey)

    toast({ title: "Login berhasil", description: "Terhubung ke Nostr" })
  }

  const logout = () => {
    localStorage.removeItem("nostr-public-key")
    localStorage.removeItem("nostr-private-key")
    setPublicKey(null)
    setPrivateKey(null)
    toast({ title: "Logout berhasil", description: "Anda telah terputus dari Nostr" })
  }

  const publishNote = async (content: string) => {
    if (!pool || !publicKey || !privateKey) return toast({ title: "Gagal", description: "Silakan login terlebih dahulu", variant: "destructive" })

    const event = finalizeEvent({ kind: 1, pubkey: publicKey, created_at: Math.floor(Date.now() / 1000), tags: [], content }, privateKey)
    await pool.publish(relays, event)

    toast({ title: "Catatan dipublikasikan", description: "Catatan berhasil dikirim ke Nostr" })
  }

  return (
    <NostrContext.Provider value={{ pool, publicKey, relays, login, logout, publishNote }}>
      {children}
    </NostrContext.Provider>
  )
}

export const useNostr = () => useContext(NostrContext)