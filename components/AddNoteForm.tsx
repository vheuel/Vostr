"use client";

import { useState } from "react";
import { useNostr } from "@/context/NostrContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddNoteForm() {
  const [content, setContent] = useState("");
  const { publishNote } = useNostr();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await publishNote(content);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 my-4">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
      />
      <Button type="submit">Publish</Button>
    </form>
  );
}