<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { $t } from '@/locales';
import { fetchGetOnlineUserList } from '@/service/api';

defineOptions({
  name: 'HomeOnlineUserPanel'
});

const router = useRouter();
const loading = ref(false);
const users = ref<Api.SystemManage.OnlineUser[]>([]);

async function loadUsers() {
  loading.value = true;
  try {
    const page = await fetchGetOnlineUserList({ current: 1, size: 100 }).catch(() => null);
    users.value = page?.records ?? [];
  } finally {
    loading.value = false;
  }
}

function goOnlineCenter() {
  router.push('/monitor/online');
}

onMounted(loadUsers);

defineExpose({ reload: loadUsers });
</script>

<template>
  <NCard :bordered="false" class="card-wrapper h-full">
    <template #header>
      <span class="text-15px font-600">{{ $t('page.home.onlineUsers') }}</span>
    </template>
    <template #header-extra>
      <div class="flex-y-center gap-8px">
        <NTag v-if="users.length" size="small" round type="success">
          {{ users.length > 99 ? '99+' : users.length }}
        </NTag>
        <NButton text type="primary" size="small" @click="goOnlineCenter">{{ $t('page.home.logAll') }}</NButton>
      </div>
    </template>
    <NSpin :show="loading" class="flex-1">
      <div v-if="users.length" class="h-full flex flex-col justify-evenly gap-10px">
        <div v-for="user in users.slice(0, 8)" :key="user.id" class="flex-y-center gap-12px rounded-8px px-12px py-8px">
          <div class="size-32px flex-center shrink-0 rounded-full bg-primary:12 text-13px font-600 text-primary">
            {{ user.userName.slice(0, 1).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-14px font-500">{{ user.userName }}</div>
            <div class="mt-2px truncate text-12px text-gray-4">
              {{ user.ipaddr || '—' }}
              <template v-if="user.browser">· {{ user.browser }} / {{ user.os }}</template>
            </div>
          </div>
          <span class="shrink-0 text-12px text-gray-4">{{ user.loginTime }}</span>
        </div>
      </div>
      <NEmpty v-else size="small" :description="$t('page.home.noLogs')" />
    </NSpin>
  </NCard>
</template>

<style scoped>
:deep(.n-card__content) {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

:deep(.n-spin-content) {
  height: 100%;
}
</style>
