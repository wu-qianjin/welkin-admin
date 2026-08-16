<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { operateTypeRecord } from '@/constants/business';
import {
  batchDeleteOperateLog,
  clearOperateLog,
  deleteOperateLog,
  fetchGetOperateLogList
} from '@/service/api';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import OperateLogSearch from './operate-log-search.vue';

defineOptions({
  name: 'OperateLog'
});

const appStore = useAppStore();

const searchParams = ref<Api.SystemManage.OperateLogSearchParams>({
  current: 1,
  size: 10,
  title: null,
  userName: null,
  businessType: null
});

const checkedRowKeys = ref<number[]>([]);

const detailVisible = ref(false);
const detailData = ref<Api.SystemManage.OperateLog | null>(null);

const { columns, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetOperateLogList(searchParams.value),
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
      key: 'title',
      title: $t('page.manage.log.operate.title'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'businessType',
      title: $t('page.manage.log.operate.businessType'),
      align: 'center',
      width: 90,
      render: row => {
        const tagMap: Record<Api.SystemManage.OperateType, NaiveUI.ThemeColor> = {
          1: 'success',
          2: 'primary',
          3: 'error',
          4: 'warning',
          5: 'info',
          6: 'default'
        };
        const label = $t(operateTypeRecord[row.businessType] ?? operateTypeRecord['6']);
        return <NTag type={tagMap[row.businessType] ?? 'default'}>{label}</NTag>;
      }
    },
    {
      key: 'userName',
      title: $t('page.manage.log.operate.userName'),
      align: 'center',
      width: 100
    },
    {
      key: 'method',
      title: $t('page.manage.log.operate.method'),
      align: 'center',
      width: 90
    },
    {
      key: 'url',
      title: $t('page.manage.log.operate.url'),
      minWidth: 200,
      ellipsis: { tooltip: true }
    },
    {
      key: 'code',
      title: $t('page.manage.log.operate.code'),
      align: 'center',
      width: 90,
      render: row => {
        const isSuccess = row.code === '0000';
        return <NTag type={isSuccess ? 'success' : 'error'}>{row.code}</NTag>;
      }
    },
    {
      key: 'costTime',
      title: $t('page.manage.log.operate.costTime'),
      align: 'center',
      width: 100,
      render: row => `${row.costTime} ms`
    },
    {
      key: 'ipaddr',
      title: $t('page.manage.log.operate.ipaddr'),
      align: 'center',
      width: 130
    },
    {
      key: 'operateTime',
      title: $t('page.manage.log.operate.operateTime'),
      align: 'center',
      width: 170
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 170,
      render: row => (
        <div class="flex-center gap-8px">
          <NButton type="info" ghost size="small" onClick={() => viewDetail(row)}>
            {$t('page.manage.log.detail')}
          </NButton>
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
        </div>
      )
    }
  ]
});

function viewDetail(row: Api.SystemManage.OperateLog) {
  detailData.value = row;
  detailVisible.value = true;
}

async function handleDelete(id: string) {
  try {
    await deleteOperateLog(id);
    getData();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleBatchDelete() {
  try {
    await batchDeleteOperateLog(checkedRowKeys.value.map(String));
    checkedRowKeys.value = [];
    getData();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleClear() {
  try {
    await clearOperateLog();
    window.$message?.success($t('page.manage.log.clearSuccess'));
    getData();
  } catch {
    // request errors are surfaced by the request layer
  }
}

function maskParams(params?: string | null) {
  if (!params) return '-';
  return params.replace(/("(?:password|token|secret)"\s*:\s*")([^"\\]*)/gi, '$1******');
}

function exportLogs() {
  const header = ['模块', '操作类型', '操作人员', '请求方式', '请求地址', '结果码', '耗时(ms)', 'IP', '操作时间'];
  const rows = data.value.map(row => [row.title, row.businessType, row.userName, row.method, row.url, row.code, row.costTime, row.ipaddr, row.operateTime]);
  const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `operate-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  window.$message?.success('操作日志已导出');
}
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <OperateLogSearch v-model:model="searchParams" @search="getDataByPage" />

    <NCard :title="$t('page.manage.log.operateTab')" :bordered="false" size="small" class="card-wrapper flex-1-hidden">
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
          <NPopconfirm @positive-click="handleBatchDelete">
            <template #trigger>
              <NButton size="small" type="error" ghost :disabled="checkedRowKeys.length === 0">
                {{ $t('common.batchDelete') }}
              </NButton>
            </template>
            {{ $t('common.confirmDelete') }}
          </NPopconfirm>
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
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :loading="loading"
        remote
        :scroll-x="1600"
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
    </NCard>

    <NDrawer v-model:show="detailVisible" :width="600">
      <NDrawerContent :title="$t('page.manage.log.detail')" :native-scrollbar="false" closable>
        <NDescriptions v-if="detailData" label-placement="left" bordered :column="1">
          <NDescriptionsItem :label="$t('page.manage.log.operate.title')">{{ detailData.title }}</NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.manage.log.operate.businessType')">
            {{ $t(operateTypeRecord[detailData.businessType] ?? operateTypeRecord['6']) }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.manage.log.operate.userName')">
            {{ detailData.userName }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.manage.log.operate.method')">{{ detailData.method }}</NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.manage.log.operate.url')">{{ detailData.url }}</NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.manage.log.operate.params')">
            <pre class="overflow-auto max-h-300px whitespace-pre-wrap break-all text-12px">{{
              maskParams(detailData.params)
            }}</pre>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.manage.log.operate.code')">{{ detailData.code }}</NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.manage.log.operate.costTime')">
            {{ detailData.costTime }} ms
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.manage.log.operate.ipaddr')">{{ detailData.ipaddr }}</NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.manage.log.operate.operateTime')">
            {{ detailData.operateTime }}
          </NDescriptionsItem>
        </NDescriptions>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>

<style scoped></style>
