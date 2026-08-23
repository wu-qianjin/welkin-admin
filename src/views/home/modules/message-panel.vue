<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { $t } from '@/locales';
import { useNoticeFeed } from '@/views/message/modules/notice-feed';

defineOptions({
  name: 'HomeMessagePanel'
});

const router = useRouter();
const { notices, unreadCount, markRead, markAllRead } = useNoticeFeed();

const latest = computed(() => notices.slice(0, 6));

/** 部分消息摘要带富文本标签，展示时剥掉 */
function plainSummary(summary: string) {
  return summary.replace(/<[^>]+>/g, '');
}

function goMessageCenter() {
  router.push('/message');
}

async function onMarkAllRead() {
  await markAllRead();
}
</script>

<template>
  <NCard :bordered="false" class="card-wrapper h-full">
    <template #header>
      <span class="text-15px font-600">{{ $t('page.home.messagePanel') }}</span>
    </template>
    <template #header-extra>
      <div class="flex-y-center gap-12px">
        <NButton v-if="unreadCount > 0" text type="primary" size="small" @click="onMarkAllRead">
          {{ $t('page.home.markAllRead') }}
        </NButton>
        <NButton text size="small" class="text-gray-4" @click="goMessageCenter">
          {{ $t('page.home.messageAll') }}
        </NButton>
      </div>
    </template>
    <div class="flex-1 flex flex-col justify-evenly gap-10px">
      <div
        v-for="notice in latest"
        :key="notice.id"
        class="cursor-pointer rounded-8px px-12px py-10px transition-colors hover:bg-primary:8"
        @click="notice.read ? goMessageCenter() : markRead(notice.id)"
      >
        <div class="flex-y-center gap-8px">
          <span class="size-8px shrink-0 rounded-full" :class="notice.read ? 'bg-gray-3' : 'bg-primary'" />
          <span class="truncate text-14px font-500" :class="notice.read ? '' : 'text-primary'">{{ notice.title }}</span>
          <span class="ml-auto shrink-0 text-12px text-gray-4">{{ notice.publishAt }}</span>
        </div>
        <div class="mt-4px truncate pl-16px text-12px text-gray-4">{{ plainSummary(notice.summary) }}</div>
      </div>
      <NEmpty v-if="latest.length === 0" size="small" :description="$t('page.home.noMessages')" />
    </div>
  </NCard>
</template>

<style scoped>
:deep(.n-card__content) {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
