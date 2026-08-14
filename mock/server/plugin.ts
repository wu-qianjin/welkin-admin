import type { Plugin } from 'vite';
import { handleMockRequest, MOCK_PROXY_PREFIX } from './index';

/**
 * serve mock/db data locally so the dev server never depends on the remote apifox instance.
 *
 * the middleware runs BEFORE vite's http proxy: matched requests under the proxy
 * prefix are answered with local data, unmatched ones fall through to the remote.
 * business code is untouched — it still requests the same `/proxy-default/*` urls.
 */
export function setupLocalMock(): Plugin {
  return {
    name: 'welkin:local-mock',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith(MOCK_PROXY_PREFIX)) {
          handleMockRequest(req, res, next);
          return;
        }
        next();
      });
    }
  };
}
