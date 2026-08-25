import { lazy } from 'react';

/**
 * Wraps dynamic React.lazy() component imports with a single-attempt page reload
 * on ChunkLoadError / dynamic import failure, avoiding infinite reload loops.
 */
export function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const pageHasBeenRefreshed = sessionStorage.getItem('chunk_retry_refreshed') === 'true';

    try {
      const component = await componentImport();
      sessionStorage.removeItem('chunk_retry_refreshed');
      return component;
    } catch (error) {
      if (!pageHasBeenRefreshed) {
        sessionStorage.setItem('chunk_retry_refreshed', 'true');
        window.location.reload();
        return new Promise(() => {}); // Hold rendering while reloading
      }
      throw error;
    }
  });
}

export default lazyWithRetry;
