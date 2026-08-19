import type { Plugin } from 'vite';
import { handleMockRequest, MOCK_PROXY_PREFIX } from './index';

/**
 * serve mock/db data locally so the dev server never depends on the remote apifox instance.
 *
 * the middleware runs BEFORE vite's http proxy: matched requests under the proxy
 * prefix are answered with local data, unmatched ones fall through to the remote.
 * business code is untouched — it still requests the same `/proxy-default/*` urls.
 */
export function setupLocalMock(viteEnv: Env.ImportMeta): Plugin {
  const mode = viteEnv.VITE_MOCK_MODE || 'hybrid';
  const includeMonitor = mode !== 'backend';
  return {
    name: 'welkin:local-mock',
    configureServer(server) {
      if (mode === 'backend') return;

      server.middlewares.use((req, res, next) => {
        const isAuthRequest = req.url?.startsWith(`${MOCK_PROXY_PREFIX}/v1/iam/auth/`);

        // A mock token cannot authenticate requests that hybrid mode forwards to the real gateway.
        if (mode === 'hybrid' && isAuthRequest) {
          next();
          return;
        }

        if (req.url?.startsWith(MOCK_PROXY_PREFIX)) {
          handleMockRequest(req, res, next, { includeMonitor });
          return;
        }
        next();
      });
    }
  };
}
