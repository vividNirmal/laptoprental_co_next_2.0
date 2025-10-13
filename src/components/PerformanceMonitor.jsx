"use client";
import { useEffect } from "react";

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production and if the browser supports Performance Observer
    if (process.env.NODE_ENV !== 'production' || typeof PerformanceObserver === 'undefined') {
      return;
    }

    // Core Web Vitals monitoring
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            console.log('LCP:', entry.startTime);
            // Track LCP
            if (typeof gtag !== 'undefined') {
              gtag('event', 'web_vitals', {
                name: 'LCP',
                value: entry.startTime,
                event_category: 'Performance'
              });
            }
            break;

          case 'first-input':
            console.log('FID:', entry.processingStart - entry.startTime);
            // Track FID
            if (typeof gtag !== 'undefined') {
              gtag('event', 'web_vitals', {
                name: 'FID',
                value: entry.processingStart - entry.startTime,
                event_category: 'Performance'
              });
            }
            break;

          case 'layout-shift':
            if (!entry.hadRecentInput) {
              console.log('CLS:', entry.value);
              // Track CLS
              if (typeof gtag !== 'undefined') {
                gtag('event', 'web_vitals', {
                  name: 'CLS',
                  value: entry.value,
                  event_category: 'Performance'
                });
              }
            }
            break;
        }
      });
    });

    // Observe Core Web Vitals
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 1000) { // Log slow resources (> 1s)
          console.warn('Slow resource:', entry.name, entry.duration + 'ms');
        }
      });
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource Observer not supported:', error);
    }

    // Monitor long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.warn('Long task detected:', entry.duration + 'ms');
        if (typeof gtag !== 'undefined') {
          gtag('event', 'long_task', {
            value: entry.duration,
            event_category: 'Performance'
          });
        }
      });
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long Task Observer not supported:', error);
    }

    // Cleanup observers
    return () => {
      observer.disconnect();
      resourceObserver.disconnect();
      longTaskObserver.disconnect();
    };
  }, []);

  // This component doesn't render anything
  return null;
}

// Utility function to measure custom metrics
export function measurePerformance(name, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start}ms`);
  
  // Track custom metrics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'custom_performance', {
      name: name,
      value: end - start,
      event_category: 'Performance'
    });
  }
  
  return result;
}

// Function to get current performance metrics
export function getPerformanceMetrics() {
  if (typeof performance === 'undefined') return null;

  const navigation = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');
  
  return {
    // Navigation timing
    domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
    loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
    
    // Paint timing
    firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
    firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
    
    // Resource timing summary
    resourceCount: performance.getEntriesByType('resource').length,
    totalResourceSize: performance.getEntriesByType('resource')
      .reduce((total, resource) => total + (resource.transferSize || 0), 0),
  };
}