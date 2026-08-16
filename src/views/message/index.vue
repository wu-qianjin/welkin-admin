<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { MessageItem } from '@/service/api';
import { useNoticeFeed } from './modules/notice-feed';

defineOptions({ name: 'MessageCenter' });

const { notices, unreadCount, load, markRead, markAllRead } = useNoticeFeed();
const activeTab = ref<'all' | 'unread'>('all');
const keyword = ref('');
const selected = ref<MessageItem | null>(null);
const detailVisible = ref(false);

const filteredNotices = computed(() =>
  notices.filter(item => {
    const matchTab = activeTab.value === 'all' || !item.read;
    const matchKeyword = !keyword.value || `${item.title}${item.summary}${item.author}`.includes(keyword.value);
    return matchTab && matchKeyword;
  })
);

function viewNotice(notice: MessageItem) {
  markRead(notice.id);
  selected.value = notice;
  detailVisible.value = true;
}

function handleMarkAllRead() {
  markAllRead();
  window.$message?.success('全部消息已标记为已读');
}

function typeLabel(type: number) {
  return type === 1 ? '通知' : type === 2 ? '公告' : '更新';
}

onMounted(load);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px">
    <NCard :bordered="false" class="card-wrapper overflow-hidden">
      <div class="flex items-center justify-between lt-sm:flex-col lt-sm:items-start lt-sm:gap-12px">
        <div>
          <div class="flex-y-center gap-10px">
            <h2 class="m-0 text-20px font-600">消息中心</h2>
            <NBadge :value="unreadCount" :max="99" />
          </div>
          <div class="mt-6px text-13px text-gray-5">查看公告、系统通知和产品更新，不错过重要信息。</div>
        </div>
        <NSpace>
          <NInput v-model:value="keyword" clearable placeholder="搜索消息" class="w-220px" />
          <NButton quaternary @click="handleMarkAllRead">全部已读</NButton>
        </NSpace>
      </div>
    </NCard>

    <NCard :bordered="false" class="card-wrapper flex-1-hidden">
      <NTabs v-model:value="activeTab" type="line">
        <NTabPane name="all" :tab="`全部消息 (${notices.length})`" />
        <NTabPane name="unread" :tab="`未读消息 (${unreadCount})`" />
      </NTabs>
      <NList hoverable>
        <NListItem
          v-for="notice in filteredNotices"
          :key="notice.id"
          class="cursor-pointer"
          @click="viewNotice(notice)"
        >
          <div class="flex gap-14px">
            <div
              class="size-40px flex-center rounded-10px"
              :class="notice.read ? 'bg-gray-2 text-gray-5' : 'bg-primary:12 text-primary'"
            >
              <icon-mdi-bell-outline v-if="notice.type === 1" class="text-21px" />
              <icon-mdi-bullhorn-outline v-else-if="notice.type === 2" class="text-21px" />
              <icon-mdi-update v-else class="text-21px" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex-y-center gap-8px">
                <span class="truncate text-15px font-500" :class="{ 'font-600': !notice.read }">
                  {{ notice.title }}
                </span>
                <NTag v-if="notice.top" size="small" type="error">置顶</NTag>
                <NTag size="small" bordered>{{ typeLabel(notice.type) }}</NTag>
              </div>
              <div class="mt-7px text-13px text-gray-5">{{ notice.summary }}</div>
              <div class="mt-8px flex flex-wrap gap-x-18px gap-y-4px text-12px text-gray-4">
                <span>{{ notice.author }}</span>
                <span>{{ notice.publishAt }}</span>
                <span>发布范围：{{ notice.scope }}</span>
              </div>
            </div>
            <span
              class="mt-6px size-8px shrink-0 rounded-full"
              :class="notice.read ? 'bg-transparent' : 'bg-primary'"
            />
          </div>
        </NListItem>
        <NEmpty v-if="!filteredNotices.length" class="py-60px" description="暂无匹配消息" />
      </NList>
    </NCard>

    <NModal v-model:show="detailVisible" preset="card" class="w-680px" :title="selected?.title">
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
  </div>
</template>

<style scoped></style>
