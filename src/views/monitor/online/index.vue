<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm } from 'naive-ui';
import { fetchGetOnlineUserList, forceLogout } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import OnlineSearch from './modules/online-search.vue';

defineOptions({
  name: 'OnlineUser'
});

const appStore = useAppStore();

const searchParams = ref<Api.SystemManage.OnlineUserSearchParams>({
  current: 1,
  size: 10,
  userName: null,
  ipaddr: null
});

const checkedRowKeys = ref<string[]>([]);

const { columns, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetOnlineUserList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page;
    searchParams.value.size = params.pageSize;
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => index + 1
    },
    {
      key: 'userName',
      title: $t('page.manage.online.userName'),
      align: 'center',
      width: 120
    },
    {
      key: 'tokenId',
      title: $t('page.manage.online.tokenId'),
      align: 'center',
      minWidth: 160,
      ellipsis: { tooltip: true }
    },
    {
      key: 'ipaddr',
      title: $t('page.manage.online.ipaddr'),
      align: 'center',
      width: 130
    },
    {
      key: 'loginLocation',
      title: $t('page.manage.online.loginLocation'),
      align: 'center',
      minWidth: 130
    },
    {
      key: 'browser',
      title: $t('page.manage.online.browser'),
      align: 'center',
      width: 120,
      ellipsis: { tooltip: true }
    },
    {
      key: 'os',
      title: $t('page.manage.online.os'),
      align: 'center',
      width: 120,
      ellipsis: { tooltip: true }
    },
    {
      key: 'loginTime',
      title: $t('page.manage.online.loginTime'),
      align: 'center',
      width: 170
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 110,
      render: row => (
        <NPopconfirm onPositiveClick={() => handleForceLogout([row.id])}>
          {{
            default: () => $t('page.manage.online.confirmForceLogout'),
            trigger: () => (
              <NButton type="error" ghost size="small">
                {$t('page.manage.online.forceLogout')}
              </NButton>
            )
          }}
        </NPopconfirm>
      )
    }
  ]
});

async function handleForceLogout(ids: string[]) {
  try {
    await forceLogout(ids);
    window.$message?.success($t('page.manage.online.forceLogoutSuccess'));
    checkedRowKeys.value = [];
    getData();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleBatchForceLogout() {
  await handleForceLogout(checkedRowKeys.value);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <OnlineSearch v-model:model="searchParams" @search="getDataByPage" />

    <NCard :title="$t('page.manage.online.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <NSpace align="center">
          <NButton size="small" @click="getData">
            <template #icon>
              <icon-mdi-refresh class="text-icon" :class="{ 'animate-spin': loading }" />
            </template>
            {{ $t('common.refresh') }}
          </NButton>
          <NPopconfirm @positive-click="handleBatchForceLogout">
            <template #trigger>
              <NButton size="small" type="error" ghost :disabled="checkedRowKeys.length === 0">
                {{ $t('page.manage.online.batchForceLogout') }}
              </NButton>
            </template>
            {{ $t('page.manage.online.confirmForceLogout') }}
          </NPopconfirm>
        </NSpace>
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :loading="loading"
        remote
        :scroll-x="1100"
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
