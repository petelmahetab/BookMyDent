"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2Icon, SparklesIcon } from "lucide-react";

export default function TestProUpgrade() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    toast.loading("Activating Pro...", { id: "upgrade" });

    try {
      const res = await fetch("/api/test-upgrade", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        toast.success("Pro activated! Refreshing...", { id: "upgrade" });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(data.error || "Failed to upgrade", { id: "upgrade" });
        setLoading(false);
      }
    } catch (error) {
      toast.error("Something went wrong", { id: "upgrade" });
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleUpgrade}
        disabled={loading}
        size="lg"
        className="shadow-lg bg-gradient-to-r from-primary to-primary/80"
      >
        {loading ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Activating...
          </>
        ) : (
          <>
            <SparklesIcon className="mr-2 h-4 w-4" />
            🧪 Test Pro
          </>
        )}
      </Button>
    </div>
  );
}