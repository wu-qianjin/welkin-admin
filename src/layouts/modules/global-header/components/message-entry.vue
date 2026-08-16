<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { $t } from '@/locales';
import type { MessageItem } from '@/service/api';
import { useNoticeFeed } from '@/views/message/modules/notice-feed';

defineOptions({ name: 'MessageEntry' });

const router = useRouter();
const show = ref(false);
const activeTab = ref<'all' | 'unread'>('all');
const selected = ref<MessageItem | null>(null);
const detailVisible = ref(false);
const { notices, unreadCount, load, markRead, markAllRead } = useNoticeFeed();
onMounted(load);

const filteredNotices = computed(() => notices.filter(item => activeTab.value === 'all' || !item.read));

function viewNotice(notice: MessageItem) {
  markRead(notice.id);
  show.value = false;
  selected.value = notice;
  detailVisible.value = true;
}

function typeLabel(type: number) {
  return type === 1 ? '通知' : type === 2 ? '公告' : '更新';
}

function viewAll() {
  show.value = false;
  router.push('/message');
}
</script>

<template>
  <NPopover v-model:show="show" trigger="click" placement="bottom-end" :width="380" :show-arrow="false">
    <template #trigger>
      <NBadge :value="unreadCount" :max="99" :offset="[-6, 4]">
        <ButtonIcon icon="mdi:message-badge-outline" :tooltip-content="$t('route.message')" />
      </NBadge>
    </template>
    <div class="w-full flex-col">
      <div class="flex-y-center justify-between">
        <span class="text-15px font-600">消息中心</span>
        <NButton quaternary size="tiny" @click="markAllRead">全部已读</NButton>
      </div>
      <NTabs v-model:value="activeTab" type="line" size="small" class="mt-2px">
        <NTabPane name="all" :tab="`全部 (${notices.length})`" />
        <NTabPane name="unread" :tab="`未读 (${unreadCount})`" />
      </NTabs>
      <div class="max-h-320px overflow-y-auto">
        <div
          v-for="notice in filteredNotices"
          :key="notice.id"
          class="flex cursor-pointer gap-10px rounded-6px px-6px py-10px hover:bg-gray-1"
          @click="viewNotice(notice)"
        >
          <div
            class="size-36px shrink-0 flex-center rounded-8px"
            :class="notice.read ? 'bg-gray-2 text-gray-5' : 'bg-primary:12 text-primary'"
          >
            <icon-mdi-bell-outline v-if="notice.type === 1" class="text-18px" />
            <icon-mdi-bullhorn-outline v-else-if="notice.type === 2" class="text-18px" />
            <icon-mdi-update v-else class="text-18px" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex-y-center gap-6px">
              <span class="truncate text-14px" :class="notice.read ? '' : 'font-600'">{{ notice.title }}</span>
              <NTag v-if="notice.top" size="small" type="error">置顶</NTag>
            </div>
            <div class="mt-3px truncate text-12px text-gray-5">{{ notice.summary }}</div>
            <div class="mt-2px text-12px text-gray-4">{{ notice.publishAt }}</div>
          </div>
          <span class="mt-4px size-8px shrink-0 rounded-full" :class="notice.read ? 'bg-transparent' : 'bg-primary'" />
        </div>
        <NEmpty v-if="!filteredNotices.length" class="py-40px" description="暂无消息" />
      </div>
      <div class="mt-4px border-t-1px border-gray-2 pt-6px">
        <NButton quaternary size="small" class="w-full" @click="viewAll">查看全部消息</NButton>
      </div>
    </div>
  </NPopover>

  <NModal v-model:show="detailVisible" preset="card" class="w-560px" :title="selected?.title">
    <div v-if="selected">
      <div class="flex-y-center gap-8px text-12px text-gray-5">
        <NTag size="small" bordered>{{ typeLabel(selected.type) }}</NTag>
        {{ selected.author }} · {{ selected.publishAt }} · {{ selected.scope }}
      </div>
      <NDivider />
      <p class="m-0 whitespace-pre-wrap text-14px leading-7">{{ selected.content }}</p>
    </div>
    <template #footer>
      <NSpace justify="end"><NButton type="primary" @click="detailVisible = false">关闭</NButton></NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
