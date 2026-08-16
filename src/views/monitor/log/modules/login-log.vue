<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { clearLoginLog, deleteLoginLog, fetchGetLoginLogList } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import LoginLogSearch from './login-log-search.vue';

defineOptions({
  name: 'LoginLog'
});

const appStore = useAppStore();

const searchParams = ref<Api.SystemManage.LoginLogSearchParams>({
  current: 1,
  size: 10,
  userName: null,
  ipaddr: null,
  status: null
});

const { columns, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetLoginLogList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page;
    searchParams.value.size = params.pageSize;
  },
  columns: () => [
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => index + 1
    },
    {
      key: 'userName',
      title: $t('page.manage.log.login.userName'),
      align: 'center',
      width: 100
    },
    {
      key: 'ipaddr',
      title: $t('page.manage.log.login.ipaddr'),
      align: 'center',
      width: 130
    },
    {
      key: 'loginLocation',
      title: $t('page.manage.log.login.loginLocation'),
      align: 'center',
      minWidth: 130
    },
    {
      key: 'browser',
      title: $t('page.manage.log.login.browser'),
      align: 'center',
      width: 120
    },
    {
      key: 'os',
      title: $t('page.manage.log.login.os'),
      align: 'center',
      width: 120
    },
    {
      key: 'status',
      title: $t('page.manage.log.login.loginStatus'),
      align: 'center',
      width: 90,
      render: row => {
        const tagMap: Record<'1' | '2', NaiveUI.ThemeColor> = {
          1: 'success',
          2: 'error'
        };
        const label = row.status === '1' ? $t('page.manage.log.login.success') : $t('page.manage.log.login.fail');
        return <NTag type={tagMap[row.status]}>{label}</NTag>;
      }
    },
    {
      key: 'msg',
      title: $t('page.manage.log.login.msg'),
      minWidth: 180,
      ellipsis: { tooltip: true }
    },
    {
      key: 'loginTime',
      title: $t('page.manage.log.login.loginTime'),
      align: 'center',
      width: 170
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 90,
      render: row => (
        <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
          {{
            default: () => $t('common.confirmDelete'),
            trigger: () => (
              <NButton type="error" ghost size="small">
                {$t('common.delete')}
              </NButton>
            )
          }}
        </NPopconfirm>
      )
    }
  ]
});

async function handleDelete(id: string) {
  try {
    await deleteLoginLog(id);
    getData();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleClear() {
  try {
    await clearLoginLog();
    window.$message?.success($t('page.manage.log.clearSuccess'));
    getData();
  } catch {
    // request errors are surfaced by the request layer
  }
}

function exportLogs() {
  const header = ['登录账号', '登录 IP', '登录地点', '浏览器', '操作系统', '状态', '提示消息', '登录时间'];
  const rows = data.value.map(row => [row.userName, row.ipaddr, row.loginLocation, row.browser, row.os, row.status === '1' ? '成功' : '失败', row.msg, row.loginTime]);
  const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `login-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  window.$message?.success('登录日志已导出');
}
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <LoginLogSearch v-model:model="searchParams" @search="getDataByPage" />

    <NCard :title="$t('page.manage.log.loginTab')" :bordered="false" size="small" class="card-wrapper flex-1-hidden">
      <template #header-extra>
        <NSpace align="center">
          <NButton size="small" @click="getData">
            <template #icon>
              <icon-mdi-refresh class="text-icon" :class="{ 'animate-spin': loading }" />
            </template>
            {{ $t('common.refresh') }}
          </NButton>
          <NButton size="small" type="primary" ghost :disabled="data.length === 0" @click="exportLogs">
            <template #icon><icon-mdi-download-outline /></template>
            导出 CSV
          </NButton>
          <NPopconfirm @positive-click="handleClear">
            <template #trigger>
              <NButton size="small" type="error" ghost :disabled="data.length === 0">
                {{ $t('page.manage.log.clear') }}
              </NButton>
            </template>
            {{ $t('page.manage.log.confirmClear') }}
          </NPopconfirm>
        </NSpace>
      </template>
      <NDataTable
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :loading="loading"
        remote
        :scroll-x="1300"
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
