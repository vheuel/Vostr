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

  // Relays utama yang digunakan
  const relays = ["wss://relay.damus.io", "wss://nos.lol", "wss://nostr.wine"]

  useEffect(() => {
    try {
      console.log("Menginisialisasi Nostr Pool...")

      const newPool = new SimplePool({
        eoseSubTimeout: 5000, // Perpanjang timeout
        getTimeout: 7000, // Timeout lebih lama
      })

      setPool(newPool)

      const storedPublicKey = document.cookie
        .split("; ")
        .find((row) => row.startsWith("nostr-public-key="))
        ?.split("=")[1]

      const storedPrivateKey = localStorage.getItem("nostr-private-key")

      if (storedPublicKey && storedPrivateKey) {
        console.log("Ditemukan kunci publik dari cookie:", storedPublicKey)
        setPublicKey(storedPublicKey)
        setPrivateKey(storedPrivateKey)
      }

      return () => {
        console.log("Menutup koneksi ke relay...")
        try {
          newPool.close(relays)
        } catch (error) {
          console.error("Gagal menutup pool:", error)
        }
      }
    } catch (error) {
      console.error("Gagal menginisialisasi Nostr pool:", error)
    }
  }, [])

  const login = (inputPrivateKey?: string) => {
    try {
      let privKey = inputPrivateKey
      if (!privKey) {
        privKey = window.crypto
          .getRandomValues(new Uint8Array(32))
          .reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")
      }

      const pubKey = getPublicKey(privKey)
      document.cookie = `nostr-public-key=${pubKey}; path=/; max-age=2592000`
      localStorage.setItem("nostr-private-key", privKey)

      setPublicKey(pubKey)
      setPrivateKey(privKey)

      toast({ title: "Login berhasil", description: "Anda terhubung ke Nostr" })
    } catch (error) {
      toast({ title: "Login gagal", description: "Kunci tidak valid", variant: "destructive" })
    }
  }

  const logout = () => {
    document.cookie = "nostr-public-key=; path=/; max-age=0"
    localStorage.removeItem("nostr-private-key")
    setPublicKey(null)
    setPrivateKey(null)

    toast({ title: "Logout berhasil", description: "Anda telah keluar dari Nostr" })
  }

  const publishNote = async (content: string) => {
    if (!pool || !publicKey || !privateKey) {
      toast({ title: "Tidak masuk", description: "Silakan login dulu", variant: "destructive" })
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

      const signedEvent = finalizeEvent(event, privateKey)
      await pool.publish(relays, signedEvent)

      toast({ title: "Catatan dipublikasikan", description: "Catatan telah dikirim ke Nostr" })
    } catch (error) {
      toast({ title: "Gagal dipublikasikan", description: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  return (
    <NostrContext.Provider value={{ pool, publicKey, relays, login, logout, publishNote }}>
      {children}
    </NostrContext.Provider>
  )
}

export const useNostr = () => useContext(NostrContext)