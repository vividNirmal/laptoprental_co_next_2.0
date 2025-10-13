"use client";
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';

export const useLoadingReset = () => {
  const pathname = usePathname();
  const { clearAllLoading } = useLoading();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // Only reset if pathname actually changed
    if (previousPathname.current !== pathname) {
      // Clear all loading states when route changes
      clearAllLoading();
      // Update the ref to current pathname
      previousPathname.current = pathname;
    }
  }, [pathname, clearAllLoading]);
};
