import { useEffect } from 'react';

export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Simple performance logging without complex metrics
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          if (navigation) {
            console.group('🚀 Performance Metrics');
            console.log('DNS Lookup:', (navigation.domainLookupEnd - navigation.domainLookupStart) + 'ms');
            console.log('Connection:', (navigation.connectEnd - navigation.connectStart) + 'ms'); 
            console.log('TTFB:', (navigation.responseStart - navigation.requestStart) + 'ms');
            console.log('Download:', (navigation.responseEnd - navigation.responseStart) + 'ms');
            console.log('DOM Interactive:', (navigation.domInteractive - navigation.fetchStart) + 'ms');
            console.log('DOM Complete:', (navigation.domComplete - navigation.fetchStart) + 'ms');
            console.log('Load Complete:', (navigation.loadEventEnd - navigation.fetchStart) + 'ms');
            console.groupEnd();
          }
        }, 0);
      });
    }
  }, []);
};