<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { $t } from '@/locales';
import type { ProfileData } from '@/service/api';

defineOptions({
  name: 'HomeTodoPanel'
});

const props = defineProps<{
  profile: ProfileData | null;
  deviceCount: number;
  unreadCount: number;
  pendingAlertCount: number;
}>();

const router = useRouter();

interface TodoItem {
  key: string;
  icon: string;
  color: string;
  text: string;
  route: string;
}

/** 待办由真实状态推导：未读消息、资料完善度、设备在线情况 */
const todos = computed<TodoItem[]>(() => {
  const items: TodoItem[] = [];
  if (props.unreadCount > 0) {
    items.push({
      key: 'unread',
      icon: 'mdi-email-alert-outline',
      color: '#2563eb',
      text: $t('page.home.todoReadMessages', { count: props.unreadCount }),
      route: '/message'
    });
  }
  if (props.profile && !props.profile.phone) {
    items.push({
      key: 'phone',
      icon: 'mdi-cellphone-link-off',
      color: '#d97706',
      text: $t('page.home.todoBindPhone'),
      route: '/user-center'
    });
  }
  if (props.profile && !props.profile.email) {
    items.push({
      key: 'email',
      icon: 'mdi-email-off-outline',
      color: '#d97706',
      text: $t('page.home.todoBindEmail'),
      route: '/user-center'
    });
  }
  if (props.profile && !props.profile.avatar) {
    items.push({
      key: 'avatar',
      icon: 'mdi-face-man-profile',
      color: '#7c3aed',
      text: $t('page.home.todoUploadAvatar'),
      route: '/user-center'
    });
  }
  if (props.deviceCount > 1) {
    items.push({
      key: 'devices',
      icon: 'mdi-devices',
      color: '#0891b2',
      text: $t('page.home.todoCheckDevices', { count: props.deviceCount }),
      route: '/user-center'
    });
  }
  if (props.pendingAlertCount > 0) {
    items.push({
      key: 'alerts',
      icon: 'mdi-bell-alert-outline',
      color: '#dc2626',
      text: $t('page.home.todoHandleAlerts', { count: props.pendingAlertCount }),
      route: '/monitor/alert'
    });
  }
  return items;
});
</script>

<template>
  <NCard :bordered="false" class="card-wrapper h-full">
    <template #header>
      <span class="text-15px font-600">{{ $t('page.home.todoPanel') }}</span>
    </template>
    <template #header-extra>
      <div class="flex-y-center gap-6px">
        <span class="text-12px text-gray-5">{{ $t('page.home.heroTodo') }}</span>
        <NTag v-if="todos.length" size="small" round type="warning">{{ todos.length > 9 ? '9+' : todos.length }}</NTag>
      </div>
    </template>
    <div class="flex-1 flex flex-col justify-evenly gap-12px">
      <div
        v-for="todo in todos"
        :key="todo.key"
        class="flex-y-center gap-12px rounded-8px bg-gray-1 px-12px py-12px dark:bg-dark"
      >
        <div
          class="size-36px flex-center shrink-0 rounded-8px text-20px"
          :style="{ color: todo.color, backgroundColor: `${todo.color}1f` }"
        >
          <SvgIcon :icon="todo.icon" />
        </div>
        <span class="min-w-0 flex-1 truncate text-14px">{{ todo.text }}</span>
        <NButton size="tiny" quaternary type="primary" @click="router.push(todo.route)">
          {{ $t('page.home.goHandle') }}
        </NButton>
      </div>
      <div v-if="todos.length === 0" class="flex flex-col items-center gap-8px py-24px">
        <icon-mdi-check-decagram-outline class="text-36px text-success" />
        <span class="text-13px text-gray-4">{{ $t('page.home.todoAllDone') }}</span>
      </div>
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
