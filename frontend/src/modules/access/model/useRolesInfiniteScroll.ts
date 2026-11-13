import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

type InfiniteScrollOptions = {
  readonly enabled: boolean;
  readonly loadNextPage: () => void;
};

/** Запрашивает следующую страницу, когда нижний маркер виден на экране. */
export function useRolesInfiniteScroll({
  enabled,
  loadNextPage,
}: InfiniteScrollOptions): RefObject<HTMLDivElement | null> {
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!enabled || !sentinel || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        loadNextPage();
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, loadNextPage]);
  return sentinelRef;
}
