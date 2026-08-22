<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { $t } from '@/locales';
import { formatDateTime } from '@/utils/common';
import type { MonitorAlertItem } from '@/service/api';

defineOptions({
  name: 'HomeAlertPanel'
});

const props = defineProps<{
  alerts: MonitorAlertItem[];
}>();

const router = useRouter();

/** 待处理 = 未恢复（status: 1 未确认 / 2 已确认），最多展示 5 条 */
const pending = computed(() => props.alerts.filter(item => item.status !== 3).slice(0, 5));

function levelTag(level: number) {
  if (level >= 3) return { type: 'error' as const, label: $t('page.home.alertLevel3') };
  if (level === 2) return { type: 'warning' as const, label: $t('page.home.alertLevel2') };
  return { type: 'info' as const, label: $t('page.home.alertLevel1') };
}

function goAlertCenter() {
  router.push('/monitor/alert');
}
</script>

<template>
  <NCard :bordered="false" class="card-wrapper h-full">
    <template #header>
      <span class="text-15px font-600">{{ $t('page.home.alertPanel') }}</span>
    </template>
    <template #header-extra>
      <div class="flex-y-center gap-8px">
        <NTag v-if="pending.length" size="small" round type="error">
          {{ pending.length > 9 ? '9+' : pending.length }}
        </NTag>
        <NButton text type="primary" size="small" @click="goAlertCenter">{{ $t('page.home.alertAll') }}</NButton>
      </div>
    </template>
    <div class="flex-1 flex flex-col justify-evenly gap-10px">
      <div
        v-for="alert in pending"
        :key="alert.id"
        class="cursor-pointer rounded-8px bg-gray-1 px-12px py-10px transition-colors hover:bg-primary:8 dark:bg-dark"
        @click="goAlertCenter"
      >
        <div class="flex-y-center gap-8px">
          <NTag :type="levelTag(alert.level).type" size="small" round>
            {{ levelTag(alert.level).label }}
          </NTag>
          <span class="truncate text-14px font-500">{{ alert.title }}</span>
          <span class="ml-auto shrink-0 text-12px text-gray-4">{{ formatDateTime(alert.occurredAt) }}</span>
        </div>
        <div class="mt-4px flex-y-center justify-between gap-8px text-12px text-gray-4">
          <span class="truncate">{{ alert.target }} · {{ alert.value }}</span>
          <span class="shrink-0">
            {{ alert.status === 2 ? $t('page.home.alertAcknowledged') : $t('page.home.alertPending') }}
          </span>
        </div>
      </div>
      <NEmpty v-if="pending.length === 0" size="small" :description="$t('page.home.noAlerts')" />
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
