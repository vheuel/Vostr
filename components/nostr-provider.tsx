"use client"

import { createContext, useContext, useEffect, useState } from "react" import { SimplePool, getPublicKey, finalizeEvent } from "nostr-tools"

type NostrContextType = { pool: SimplePool | null publicKey: string | null relays: string[] login: (privateKey?: string) => void logout: () => void publishNote: (content: string) => Promise<void> }

const NostrContext = createContext<NostrContextType | undefined>(undefined)

export function NostrProvider({ children }: { children: React.ReactNode }) { const [pool, setPool] = useState<SimplePool | null>(null) const [publicKey, setPublicKey] = useState<string | null>(null) const [privateKey, setPrivateKey] = useState<string | null>(null)

const relays = ["wss://relay.damus.io", "wss://nos.lol"]

useEffect(() => { const newPool = new SimplePool() setPool(newPool) }, [])

const login = (inputPrivateKey?: string) => { if (!inputPrivateKey) return

const pubKey = getPublicKey(inputPrivateKey)
setPublicKey(pubKey)
setPrivateKey(inputPrivateKey)

}

const logout = () => { setPublicKey(null) setPrivateKey(null) }

const publishNote = async (content: string) => { if (!pool || !publicKey || !privateKey) return

const event = finalizeEvent(
  { kind: 1, pubkey: publicKey, created_at: Math.floor(Date.now() / 1000), tags: [], content },
  privateKey
)

await pool.publish(relays, event)

}

return ( <NostrContext.Provider value={{ pool, publicKey, relays, login, logout, publishNote }}> {children} </NostrContext.Provider> ) }

export const useNostr = () => { const context = useContext(NostrContext) if (!context) throw new Error("useNostr must be used within a NostrProvider") return context }

