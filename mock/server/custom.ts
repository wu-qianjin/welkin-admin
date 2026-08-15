import type { MockRoute } from './types';

/**
 * Project-specific mock extensions.
 *
 * Add routes here when a page needs a response that is not part of the
 * built-in mock data. In `hybrid` mode these routes take precedence over the
 * built-in routes, while unmatched requests continue to the configured
 * backend/mock server.
 */
export const customMockRoutes: MockRoute[] = [
  // Example:
  // {
  //   method: 'GET',
  //   path: '/demo/custom',
  //   handler({ res }) {
  //     sendData(res, { source: 'custom-mock', message: '可在此扩展自定义响应' });
  //   }
  // }
];
