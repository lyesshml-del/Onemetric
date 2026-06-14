"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InstallSnippet({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — user can still select manually
    }
  };

  return (
    <div className="space-y-3">
      <pre className="bg-muted text-foreground overflow-x-auto rounded-md border p-4 text-sm">
        <code>{snippet}</code>
      </pre>
      <Button type="button" variant="outline" size="sm" onClick={copy}>
        {copied ? "Copied!" : "Copy snippet"}
      </Button>
    </div>
  );
}
