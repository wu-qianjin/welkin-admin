import { computed, reactive } from 'vue';
import { mockNoticeFeed } from '@/mock/admin';

/** module-level state so the header badge and the message page share read status */
const notices = reactive(mockNoticeFeed.map(item => ({ ...item })));

export function useNoticeFeed() {
  const unreadCount = computed(() => notices.filter(item => !item.read).length);

  function markAllRead() {
    notices.forEach(item => {
      item.read = true;
    });
  }

  return { notices, unreadCount, markAllRead };
}
