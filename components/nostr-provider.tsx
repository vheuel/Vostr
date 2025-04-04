"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  SimplePool,
  getPublicKey,
  finalizeEvent,
  type Event as NostrEvent,
} from "nostr-tools";
import { useToast } from "@/hooks/use-toast";

export type NostrContextType = {
  pool: SimplePool | null;
  publicKey: string | null;
  relays: string[];
  notes: NostrEvent[];
  login: (privateKey?: string) => void;
  logout: () => void;
  publishNote: (content: string) => void;
  publishReaction: (eventId: string, reaction: string) => void;
  publishRepost: (eventId: string) => void;
  addNote: (note: NostrEvent) => void;
};

const NostrContext = createContext<NostrContextType>({
  pool: null,
  publicKey: null,
  relays: [],
  notes: [],
  login: () => {},
  logout: () => {},
  publishNote: () => {},
  publishReaction: () => {},
  publishRepost: () => {},
  addNote: () => {},
});

export function NostrProvider({ children }: { children: React.ReactNode }) {
  const [pool, setPool] = useState<SimplePool | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [notes, setNotes] = useState<NostrEvent[]>([]);
  const { toast } = useToast();

  const relays = ["wss://relay.damus.io", "wss://nos.lol"];

  useEffect(() => {
    try {
      const newPool = new SimplePool({
        eoseSubTimeout: 3000,
        getTimeout: 3000,
      });
      setPool(newPool);

      const storedPublicKey = document.cookie
        .split("; ")
        .find((row) => row.startsWith("nostr-public-key="))
        ?.split("=")[1];

      const storedPrivateKey = localStorage.getItem("nostr-private-key");

      if (storedPublicKey && storedPrivateKey) {
        setPublicKey(storedPublicKey);
        setPrivateKey(storedPrivateKey);
      }

      return () => {
        try {
          newPool.close(relays);
        } catch (error) {
          console.error("Error closing pool:", error);
        }
      };
    } catch (error) {
      console.error("Error initializing Nostr pool:", error);
    }
  }, []);

  const login = (inputPrivateKey?: string) => {
    try {
      let privKey = inputPrivateKey;
      if (!privKey) {
        privKey = window.crypto.getRandomValues(new Uint8Array(32)).reduce(
          (acc, val) => acc + val.toString(16).padStart(2, "0"),
          ""
        );
      }

      // Validasi format hex
      if (!/^[0-9a-f]{64}$/i.test(privKey)) {
        throw new Error("Invalid private key format");
      }

      const pubKey = getPublicKey(privKey);

      document.cookie = `nostr-public-key=${pubKey}; path=/; max-age=2592000`;
      localStorage.setItem("nostr-private-key", privKey);

      setPublicKey(pubKey);
      setPrivateKey(privKey);

      toast({
        title: "Logged in successfully",
        description: "You are now connected to Nostr",
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid private key",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    document.cookie = "nostr-public-key=; path=/; max-age=0";
    localStorage.removeItem("nostr-private-key");
    setPublicKey(null);
    setPrivateKey(null);
    setNotes([]);

    toast({
      title: "Logged out",
      description: "You have been disconnected from Nostr",
    });
  };

  const publishNote = (content: string) => {
    if (!pool || !publicKey || !privateKey) {
      toast({
        title: "Not logged in",
        description: "Please log in to publish notes",
        variant: "destructive",
      });
      return;
    }

    try {
      const event = {
        kind: 1,
        pubkey: publicKey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content,
      };

      const signedEvent = finalizeEvent(event, privateKey);
      pool.publish(relays, signedEvent);
      addNote(signedEvent);

      toast({
        title: "Note published",
        description: "Your note has been published to Nostr",
      });
    } catch (error) {
      console.error("Publish note error:", error);
      toast({
        title: "Failed to publish note",
        description: "An error occurred while publishing your note",
        variant: "destructive",
      });
    }
  };

  const publishReaction = (eventId: string, reaction: string) => {
    if (!pool || !publicKey || !privateKey) return;

    try {
      const event = {
        kind: 7,
        pubkey: publicKey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["e", eventId]],
        content: reaction,
      };

      const signedEvent = finalizeEvent(event, privateKey);
      pool.publish(relays, signedEvent);
    } catch (error) {
      console.error("Publish reaction error:", error);
    }
  };

  const publishRepost = (eventId: string) => {
    if (!pool || !publicKey || !privateKey) return;

    try {
      const event = {
        kind: 6,
        pubkey: publicKey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["e", eventId]],
        content: "",
      };

      const signedEvent = finalizeEvent(event, privateKey);
      pool.publish(relays, signedEvent);
    } catch (error) {
      console.error("Publish repost error:", error);
    }
  };

  const addNote = (note: NostrEvent) => {
    setNotes((prev) => [note, ...prev]);
  };

  return (
    <NostrContext.Provider
      value={{
        pool,
        publicKey,
        relays,
        notes,
        login,
        logout,
        publishNote,
        publishReaction,
        publishRepost,
        addNote,
      }}
    >
      {children}
    </NostrContext.Provider>
  );
}

export const useNostr = () => useContext(NostrContext);