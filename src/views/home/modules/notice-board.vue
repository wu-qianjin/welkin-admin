<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import DOMPurify from 'dompurify';
import { $t } from '@/locales';
import { noticeTypeRecord } from '@/constants/business';
import { formatDateTime } from '@/utils/common';

defineOptions({
  name: 'HomeNoticeBoard'
});

const props = defineProps<{
  notices: Api.SystemManage.SystemNotice[];
}>();

const router = useRouter();
const detailVisible = ref(false);
const activeNotice = ref<Api.SystemManage.SystemNotice | null>(null);

/** 富文本在渲染边界统一消毒，不信任后端存储内容（与公告管理页一致） */
const activeContentHtml = computed(() => DOMPurify.sanitize(activeNotice.value?.content ?? ''));

function openDetail(notice: Api.SystemManage.SystemNotice) {
  activeNotice.value = notice;
  detailVisible.value = true;
}

function goNoticeCenter() {
  router.push('/system/notice');
}

function tagType(noticeType: Api.SystemManage.NoticeType) {
  return noticeType === '2' ? 'warning' : 'info';
}
</script>

<template>
  <NCard :bordered="false" class="card-wrapper h-full">
    <template #header>
      <span class="text-15px font-600">{{ $t('page.home.noticeBoard') }}</span>
    </template>
    <template #header-extra>
      <NButton text type="primary" size="small" @click="goNoticeCenter">{{ $t('page.home.noticeAll') }}</NButton>
    </template>
    <div class="flex-1 flex flex-col justify-evenly gap-10px">
      <div
        v-for="notice in props.notices"
        :key="notice.id"
        class="cursor-pointer rounded-8px px-12px py-10px transition-colors hover:bg-primary:8"
        @click="openDetail(notice)"
      >
        <div class="flex-y-center gap-8px">
          <NTag :type="tagType(notice.noticeType)" size="small" round>
            {{ $t(noticeTypeRecord[notice.noticeType]) }}
          </NTag>
          <icon-mdi-pin v-if="notice.isTop" class="shrink-0 text-14px text-warning" :title="$t('page.home.pinned')" />
          <span class="truncate text-14px font-500">{{ notice.title }}</span>
          <span class="ml-auto shrink-0 text-12px text-gray-4">{{ formatDateTime(notice.createTime) }}</span>
        </div>
        <div class="mt-4px truncate pl-2px text-12px text-gray-4">
          {{ notice.content.replace(/<[^>]+>/g, '').slice(0, 60) }}
        </div>
      </div>
      <NEmpty v-if="props.notices.length === 0" size="small" :description="$t('page.home.noNotices')" />
    </div>

    <NModal v-model:show="detailVisible" preset="card" class="w-640px" :title="activeNotice?.title">
      <div class="mb-8px flex-y-center gap-8px text-12px text-gray-4">
        <NTag v-if="activeNotice" :type="tagType(activeNotice.noticeType)" size="small" round>
          {{ $t(noticeTypeRecord[activeNotice.noticeType]) }}
        </NTag>
        <span v-if="activeNotice?.createTime">{{ formatDateTime(activeNotice.createTime) }}</span>
      </div>
      <!-- 富文本经 DOMPurify 消毒后渲染，防止存储型 XSS -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="notice-content text-14px leading-7" v-html="activeContentHtml"></div>
    </NModal>
  </NCard>
</template>

<style scoped>
:deep(.n-card__content) {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.notice-content :deep(img) {
  max-width: 100%;
}

.notice-content :deep(p) {
  margin: 0 0 8px;
}
</style>
