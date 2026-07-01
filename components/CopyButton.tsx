"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="btn btn-surface"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard may be unavailable over http on some devices */
        }
      }}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
