<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { $t } from '@/locales';

defineOptions({
  name: 'HomeScaleStrip'
});

const props = defineProps<{
  userCount: number;
  onlineCount: number;
  roleCount: number;
  deptCount: number;
  noticeCount: number;
}>();

const router = useRouter();

const cards = computed(() => [
  {
    key: 'users',
    label: $t('page.home.platformUsers'),
    value: $t('page.home.unitPeople', { count: props.userCount }),
    detail: $t('page.home.unitPeople', { count: props.userCount }),
    icon: 'mdi:account-group-outline',
    color: '#2563eb',
    bg: 'rgba(37, 99, 235, 0.1)',
    route: '/auth/user'
  },
  {
    key: 'online',
    label: $t('page.home.onlineUsers'),
    value: $t('page.home.unitPeople', { count: props.onlineCount }),
    detail: $t('page.home.unitPeople', { count: props.onlineCount }),
    icon: 'mdi:access-point',
    color: '#16a34a',
    bg: 'rgba(22, 163, 74, 0.1)',
    route: '/monitor/online'
  },
  {
    key: 'roles',
    label: $t('page.home.roleCount'),
    value: $t('page.home.unitRoles', { count: props.roleCount }),
    detail: $t('page.home.unitRoles', { count: props.roleCount }),
    icon: 'mdi:shield-account-outline',
    color: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.1)',
    route: '/auth/role'
  },
  {
    key: 'depts',
    label: $t('page.home.deptCount'),
    value: $t('page.home.unitDepts', { count: props.deptCount }),
    detail: $t('page.home.unitDepts', { count: props.deptCount }),
    icon: 'mdi:source-branch',
    color: '#0891b2',
    bg: 'rgba(8, 145, 178, 0.1)',
    route: '/auth/dept'
  },
  {
    key: 'notices',
    label: $t('page.home.noticeTotalLabel'),
    value: $t('page.home.unitNotices', { count: props.noticeCount }),
    detail: $t('page.home.unitNotices', { count: props.noticeCount }),
    icon: 'mdi:bullhorn-outline',
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.1)',
    route: '/system/notice'
  }
]);
</script>

<template>
  <NGrid cols="2 s:3 l:5" responsive="screen" :x-gap="16" :y-gap="16">
    <NGi v-for="card in cards" :key="card.key">
      <NCard
        :bordered="false"
        class="card-wrapper cursor-pointer h-full transition-colors hover:border-primary"
        @click="router.push(card.route)"
      >
        <div class="flex items-center gap-12px">
          <div
            class="size-40px flex-center shrink-0 rounded-8px text-22px"
            :style="{ color: card.color, backgroundColor: card.bg }"
          >
            <SvgIcon :icon="card.icon" />
          </div>
          <div class="min-w-0">
            <div class="text-12px text-gray-5">{{ card.label }}</div>
            <div class="mt-2px text-18px font-600">{{ card.value }}</div>
          </div>
        </div>
      </NCard>
    </NGi>
  </NGrid>
</template>

<style scoped></style>
