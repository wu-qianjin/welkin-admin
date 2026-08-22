<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';
import type { RouteKey } from '@elegant-router/types';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';
import { parseUserAgent } from '@/utils/user-agent';
import type { ProfileData } from '@/service/api';

defineOptions({
  name: 'HeroBanner'
});

const props = defineProps<{
  profile: ProfileData | null;
  lastLoginUserAgent: string;
  todoCount: number;
  unreadCount: number;
  noticeCount: number;
  refreshing: boolean;
  lastUpdated: string;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const authStore = useAuthStore();
const { routerPushByKey } = useRouterPush();

const greeting = computed(() => {
  const hour = dayjs().hour();
  const userName = authStore.userInfo.userName;
  if (hour < 11) return $t('page.home.greetingMorning', { userName });
  if (hour < 13) return $t('page.home.greetingNoon', { userName });
  if (hour < 18) return $t('page.home.greetingAfternoon', { userName });
  return $t('page.home.greetingEvening', { userName });
});

const dateLine = computed(() => dayjs().format('YYYY-MM-DD dddd'));

const avatarText = computed(() =>
  (props.profile?.nickName || authStore.userInfo.userName || 'U').slice(0, 1).toUpperCase()
);

/** 最近登录设备的操作系统标签（图标 + 品牌色），取自最近一次会话的 User-Agent */
const osTag = computed(() => {
  const os = parseUserAgent(props.lastLoginUserAgent).os;
  const map: Record<string, { icon: string; color: string }> = {
    Windows: { icon: 'mdi:microsoft-windows', color: '#0078d6' },
    macOS: { icon: 'mdi:apple', color: '#6b7280' },
    iPhone: { icon: 'mdi:apple-ios', color: '#6b7280' },
    iPad: { icon: 'mdi:apple-ios', color: '#6b7280' },
    Android: { icon: 'mdi:android', color: '#3dda84' },
    Linux: { icon: 'mdi:linux', color: '#e3b341' }
  };
  const hit = os ? map[os] : undefined;
  return hit ? { ...hit, label: os, bg: `${hit.color}1a` } : null;
});

const quickEntries: Array<{ icon: string; label: string; routeKey: RouteKey }> = [
  { icon: 'mdi-email-outline', label: $t('page.home.entryMessage'), routeKey: 'message' },
  { icon: 'mdi-bullhorn-outline', label: $t('page.home.entryNotice'), routeKey: 'system_notice' },
  { icon: 'mdi-account-circle-outline', label: $t('page.home.entryProfile'), routeKey: 'user-center' },
  { icon: 'mdi-account-group-outline', label: $t('page.home.entryUser'), routeKey: 'auth_user' }
];

const heroStats = computed(() => [
  { label: $t('page.home.heroTodo'), value: props.todoCount, color: '#d97706' },
  { label: $t('page.home.heroUnread'), value: props.unreadCount, color: '#2563eb' },
  { label: $t('page.home.heroNotice'), value: props.noticeCount, color: '#16a34a' }
]);
</script>

<template>
  <NCard :bordered="false" class="card-wrapper">
    <div class="flex flex-wrap items-center justify-between gap-x-24px gap-y-16px">
      <div class="flex min-w-0 items-center gap-14px">
        <AuthAvatar :path="profile?.avatar || ''" :text="avatarText" :size="56" color="#4c5fd7" />
        <div class="min-w-0">
          <div class="flex-y-center gap-10px">
            <h2 class="m-0 truncate text-20px font-600">{{ greeting }}</h2>
            <NTag v-if="authStore.userInfo.roles[0]" size="small" round>
              {{ authStore.userInfo.roles[0] }}
            </NTag>
          </div>
          <div class="mt-6px flex flex-wrap items-center gap-x-12px gap-y-4px text-13px text-gray-5">
            <span>{{ dateLine }}</span>
            <span class="text-gray-3">|</span>
            <span class="flex-y-center gap-6px">
              {{ $t('page.home.lastLogin') }}：{{ profile?.lastLoginAt || '—' }}
              <template v-if="profile?.lastLoginIp">（{{ profile.lastLoginIp }}）</template>
              <NTag
                v-if="osTag"
                size="small"
                round
                :bordered="false"
                :color="{ color: osTag.bg, textColor: osTag.color }"
                class="ml-2px"
              >
                <template #icon>
                  <SvgIcon :icon="osTag.icon" class="text-13px" />
                </template>
                {{ osTag.label }}
              </NTag>
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-20px">
        <div v-for="(stat, index) in heroStats" :key="stat.label" class="flex items-center gap-20px">
          <NDivider v-if="index > 0" vertical />
          <div class="text-center">
            <div class="text-20px font-600" :style="{ color: stat.color }">{{ stat.value }}</div>
            <div class="mt-2px text-12px text-gray-5">{{ stat.label }}</div>
          </div>
        </div>
        <NDivider vertical />
        <NButton
          circle
          quaternary
          :loading="refreshing"
          :title="$t('page.home.lastUpdated', { time: lastUpdated })"
          @click="emit('refresh')"
        >
          <template #icon>
            <icon-mdi-refresh />
          </template>
        </NButton>
      </div>
    </div>

    <NDivider class="my-14px!" />

    <div class="flex flex-wrap items-center gap-x-24px gap-y-8px">
      <span class="text-12px text-gray-4">{{ $t('page.home.quickEntry') }}</span>
      <button
        v-for="entry in quickEntries"
        :key="entry.routeKey"
        type="button"
        class="flex-y-center cursor-pointer gap-6px border-none bg-transparent p-0 text-13px text-gray-5 transition-colors hover:text-primary"
        @click="routerPushByKey(entry.routeKey)"
      >
        <SvgIcon :icon="entry.icon" class="text-16px" />
        {{ entry.label }}
      </button>
    </div>
  </NCard>
</template>

<style scoped></style>
