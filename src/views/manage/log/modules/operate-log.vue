<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { operateTypeOptions, operateTypeRecord } from '@/constants/business';
import { translateOptions } from '@/utils/common';
import {
  batchDeleteOperateLog,
  clearOperateLog,
  deleteOperateLog,
  fetchGetOperateLogList
} from '@/service/api';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';

defineOptions({
  name: 'OperateLog'
});

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
        const label = $t(operateTypeRecord[row.businessType]);
        return <NTag type={tagMap[row.businessType]}>{label}</NTag>;
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

async function handleDelete(id: number) {
  try {
    await deleteOperateLog(id);
    getData();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleBatchDelete() {
  try {
    await batchDeleteOperateLog(checkedRowKeys.value.map(Number));
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
</script>

<template>
  <div class="flex-col-stretch gap-12px">
    <NCard :bordered="false" size="small">
      <div class="flex-y-center gap-12px lt-sm:flex-col lt-sm:items-stretch">
        <NInput
          v-model:value="searchParams.title"
          :placeholder="$t('page.manage.log.operate.form.title')"
          clearable
          class="w-150px lt-sm:w-full"
          @keydown.enter="() => getDataByPage()"
        />
        <NInput
          v-model:value="searchParams.userName"
          :placeholder="$t('page.manage.log.operate.form.userName')"
          clearable
          class="w-150px lt-sm:w-full"
          @keydown.enter="() => getDataByPage()"
        />
        <NSelect
          v-model:value="searchParams.businessType"
          :placeholder="$t('page.manage.log.operate.form.businessType')"
          :options="translateOptions(operateTypeOptions)"
          clearable
          class="w-120px lt-sm:w-full"
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
              searchParams.title = null;
              searchParams.userName = null;
              searchParams.businessType = null;
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
        <div class="ml-auto flex-y-center gap-12px">
          <NPopconfirm @positive-click="handleBatchDelete">
            <template #trigger>
              <NButton type="error" ghost :disabled="checkedRowKeys.length === 0">
                {{ $t('common.batchDelete') }}
              </NButton>
            </template>
            {{ $t('common.confirmDelete') }}
          </NPopconfirm>
          <NPopconfirm @positive-click="handleClear">
            <template #trigger>
              <NButton type="error" ghost :disabled="data.length === 0">
                {{ $t('page.manage.log.clear') }}
              </NButton>
            </template>
            {{ $t('page.manage.log.confirmClear') }}
          </NPopconfirm>
        </div>
      </div>
    </NCard>

    <NDataTable
      v-model:checked-row-keys="checkedRowKeys"
      :columns="columns"
      :data="data"
      size="small"
      :loading="loading"
      remote
      :scroll-x="1600"
      :row-key="row => row.id"
      :pagination="mobilePagination"
    />

    <NDrawer v-model:show="detailVisible" :width="600">
      <NDrawerContent :title="$t('page.manage.log.detail')" :native-scrollbar="false" closable>
        <NDescriptions v-if="detailData" label-placement="left" bordered :column="1">
          <NDescriptionsItem :label="$t('page.manage.log.operate.title')">{{ detailData.title }}</NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.manage.log.operate.businessType')">
            {{ $t(operateTypeRecord[detailData.businessType]) }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.manage.log.operate.userName')">
            {{ detailData.userName }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.manage.log.operate.method')">{{ detailData.method }}</NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.manage.log.operate.url')">{{ detailData.url }}</NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.manage.log.operate.params')">
            <pre class="overflow-auto max-h-300px whitespace-pre-wrap break-all text-12px">{{ detailData.params }}</pre>
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
