import { computed, reactive } from 'vue';
import { fetchMessageList, markAllMessagesRead, markMessageRead, type MessageItem } from '@/service/api';

/** module-level state so the header badge and the message page share read status */
const notices = reactive<MessageItem[]>([]);

export function useNoticeFeed() {
  const unreadCount = computed(() => notices.filter(item => !item.read).length);

  async function load() {
    const page = await fetchMessageList({ current: 1, size: 100 });
    notices.splice(0, notices.length, ...page.records);
  }

  async function markRead(id: string) {
    await markMessageRead(id);
    const notice = notices.find(item => item.id === id);
    if (notice) notice.read = true;
  }

  async function markAllRead() {
    await markAllMessagesRead();
    notices.forEach(item => {
      item.read = true;
    });
  }

  return { notices, unreadCount, load, markRead, markAllRead };
}
