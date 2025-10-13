"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function RouteLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Start loading when path/search changes
    setLoading(true);

    // Simulate small delay to show loader (otherwise too fast)
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Loader2 className="h-10 w-10 animate-spin text-white" />
      <span className="ml-3 text-white">Loading...</span>
    </div>
  );
}

export default function RouteLoader() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
        <span className="ml-3 text-white">Loading...</span>
      </div>
    }>
      <RouteLoaderInner />
    </Suspense>
  );
}
