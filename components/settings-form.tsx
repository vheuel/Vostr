"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useNostr } from "./nostr-provider"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function SettingsForm() {
  const { publicKey } = useNostr()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [about, setAbout] = useState("")
  const [nip05, setNip05] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)

  const handleSave = () => {
    // In a real app, you would publish a kind 0 event with the profile metadata
    toast({
      title: "Settings saved",
      description: "Your profile has been updated",
    })
  }

  if (!publicKey) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Please log in to access settings</div>
  }

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your display name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about">About</Label>
            <Textarea
              id="about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Tell us about yourself"
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nip05">NIP-05 Identifier</Label>
            <Input id="nip05" value={nip05} onChange={(e) => setNip05(e.target.value)} placeholder="you@example.com" />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave}>Save Profile</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <div className="text-sm text-muted-foreground">Switch between light and dark theme</div>
            </div>
            <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notifications</Label>
              <div className="text-sm text-muted-foreground">Receive notifications for new interactions</div>
            </div>
            <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              toast({
                title: "Settings saved",
                description: "Your application settings have been updated",
              })
            }}
          >
            Save Settings
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relays</CardTitle>
          <CardDescription>Manage your Nostr relays</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Relays</Label>
            <div className="space-y-2">
              <div className="p-2 border rounded-md">wss://relay.damus.io</div>
              <div className="p-2 border rounded-md">wss://relay.nostr.band</div>
              <div className="p-2 border rounded-md">wss://nos.lol</div>
              <div className="p-2 border rounded-md">wss://relay.current.fyi</div>
              <div className="p-2 border rounded-md">wss://relay.snort.social</div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-relay">Add Relay</Label>
            <div className="flex gap-2">
              <Input id="new-relay" placeholder="wss://relay.example.com" />
              <Button variant="outline">Add</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

