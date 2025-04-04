"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useNostr } from "@/components/nostr-provider"
import { nip19 } from "nostr-tools"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface LoginPromptProps {
  onLoginSuccess?: () => void
}

export function LoginPrompt({ onLoginSuccess }: LoginPromptProps) {
  const [privateKey, setPrivateKey] = useState("")
  const { login } = useNostr()
  const { toast } = useToast()
  const router = useRouter()

  const processPrivateKey = (key: string): string => {
    key = key.trim()
    // Check if it's an nsec format key
    if (key.startsWith("nsec")) {
      try {
        const { data } = nip19.decode(key)
        return data as string
      } catch (error) {
        return ""
      }
    }
    // Return as is if it's hex format
    return key
  }

  const handleLogin = () => {
    if (privateKey.trim()) {
      const processedKey = processPrivateKey(privateKey.trim())
      if (processedKey) {
        login(processedKey)

        // Dispatch custom event for login success
        const loginSuccessEvent = new Event("nostr:login-success")
        window.dispatchEvent(loginSuccessEvent)

        if (onLoginSuccess) {
          onLoginSuccess()
        }

        router.push("/")
      } else {
        toast({
          title: "Invalid key format",
          description: "Please enter a valid hex or nsec format key",
          variant: "destructive",
        })
      }
    }
  }

  const handleGenerateNew = () => {
    login()

    const loginSuccessEvent = new Event("nostr:login-success")
    window.dispatchEvent(loginSuccessEvent)

    if (onLoginSuccess) {
      onLoginSuccess()
    }

    router.push("/")
  }

  return (
    <div className="p-4 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to Nostr</CardTitle>
          <CardDescription>
            Enter your private key (hex or nsec format) or generate a new one to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="privateKey">Private Key (hex or nsec)</Label>
            <Input
              id="privateKey"
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Enter your private key"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={handleLogin}>
            Login with Key
          </Button>
          <Button variant="outline" className="w-full" onClick={handleGenerateNew}>
            Generate New Key
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}