import { alova } from '../request';

export interface MessageItem {
  id: string;
  noticeId: string;
  title: string;
  type: number;
  summary: string;
  content: string;
  author: string;
  publishAt: string;
  read: boolean;
  top: boolean;
  scope: string;
}

export function fetchMessageList(params: { current: number; size: number; unread?: boolean; keyword?: string }) {
  return alova.Post<{ records: MessageItem[]; current: number; size: number; total: number }>(
    '/v1/system/message/page',
    params
  );
}

export function markMessageRead(id: string) {
  return alova.Put<null>(`/v1/system/message/${id}/read`, {});
}

export function markAllMessagesRead() {
  return alova.Put<null>('/v1/system/message/readAll', {});
}

export function fetchUnreadMessageCount() {
  return alova.Get<{ count: number }>('/v1/system/message/unreadCount');
}
