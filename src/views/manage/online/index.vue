<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm } from 'naive-ui';
import { fetchGetOnlineUserList, forceLogout } from '@/service/api';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';

defineOptions({
  name: 'OnlineUser'
});

const searchParams = ref<Api.SystemManage.OnlineUserSearchParams>({
  current: 1,
  size: 10,
  userName: null,
  ipaddr: null
});

const checkedRowKeys = ref<number[]>([]);

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
      width: 120
    },
    {
      key: 'os',
      title: $t('page.manage.online.os'),
      align: 'center',
      width: 120
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

async function handleForceLogout(ids: number[]) {
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
  await handleForceLogout(checkedRowKeys.value.map(Number));
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :bordered="false" size="small" class="card-wrapper">
      <div class="flex-y-center gap-12px lt-sm:flex-col lt-sm:items-stretch">
        <NInput
          v-model:value="searchParams.userName"
          :placeholder="$t('page.manage.online.form.userName')"
          clearable
          class="w-160px lt-sm:w-full"
          @keydown.enter="() => getDataByPage()"
        />
        <NInput
          v-model:value="searchParams.ipaddr"
          :placeholder="$t('page.manage.online.form.ipaddr')"
          clearable
          class="w-160px lt-sm:w-full"
          @keydown.enter="() => getDataByPage()"
        />
        <NButton type="primary" ghost @click="() => getDataByPage()">
          <template #icon>
            <icon-ic-round-search class="text-icon" />
          </template>
          {{ $t('common.search') }}
        </NButton>
        <NButton
          quaternary
          @click="
            () => {
              searchParams.userName = null;
              searchParams.ipaddr = null;
              getDataByPage();
            }
          "
        >
          <template #icon>
            <icon-ic-round-refresh class="text-icon" />
          </template>
          {{ $t('common.reset') }}
        </NButton>
        <NButton quaternary @click="getData">
          <template #icon>
            <icon-ic-round-refresh class="text-icon" />
          </template>
          {{ $t('common.refresh') }}
        </NButton>
        <div class="ml-auto">
          <NPopconfirm @positive-click="handleBatchForceLogout">
            <template #trigger>
              <NButton type="error" ghost :disabled="checkedRowKeys.length === 0">
                {{ $t('page.manage.online.batchForceLogout') }}
              </NButton>
            </template>
            {{ $t('page.manage.online.confirmForceLogout') }}
          </NPopconfirm>
        </div>
      </div>
    </NCard>

    <NCard :title="$t('page.manage.online.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :loading="loading"
        remote
        :scroll-x="1100"
        :row-key="row => row.id"
        :pagination="mobilePagination"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
