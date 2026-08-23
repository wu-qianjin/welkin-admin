import { addAPIProvider, addCollection } from '@iconify/vue';
import { offlineIconifyCollections } from './iconify-offline.generated';

/** Setup the iconify offline */
export function setupIconifyOffline() {
  // bundled icons resolve locally; the api is only a fallback for names added later
  for (const collection of offlineIconifyCollections) {
    addCollection(collection as unknown as Parameters<typeof addCollection>[0]);
  }

  const { VITE_ICONIFY_URL } = import.meta.env;

  if (VITE_ICONIFY_URL) {
    addAPIProvider('', { resources: [VITE_ICONIFY_URL] });
  }
}
